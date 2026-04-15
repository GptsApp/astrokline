import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/db';
import { chat, chatMessage } from '@/config/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getUserInfo } from '@/shared/models/user';

function parseChatMetadata(rawMetadata: unknown) {
  if (typeof rawMetadata !== 'string' || !rawMetadata.trim()) {
    return {} as Record<string, unknown>;
  }

  try {
    const parsed = JSON.parse(rawMetadata);
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {} as Record<string, unknown>;
  }
}

function getThreadPresentation(
  metadata: Record<string, unknown>,
  fallbackTitle: string | null
) {
  const activeContext =
    metadata.activeContext && typeof metadata.activeContext === 'object'
      ? (metadata.activeContext as Record<string, unknown>)
      : metadata.askContext && typeof metadata.askContext === 'object'
        ? (metadata.askContext as Record<string, unknown>)
        : null;

  const promptLabel =
    activeContext && typeof activeContext.promptLabel === 'string'
      ? activeContext.promptLabel.trim()
      : null;
  const selectedYear =
    activeContext && typeof activeContext.selectedYear === 'number'
      ? activeContext.selectedYear
      : null;
  const threadTitle =
    typeof metadata.threadTitle === 'string' && metadata.threadTitle.trim()
      ? metadata.threadTitle.trim()
      : promptLabel
        ? selectedYear
          ? `${promptLabel} · ${selectedYear}`
          : promptLabel
        : fallbackTitle?.trim() || 'Untitled conversation';
  const threadTheme =
    typeof metadata.threadTheme === 'string' && metadata.threadTheme.trim()
      ? metadata.threadTheme.trim()
      : promptLabel;
  const lastUserQuestion =
    typeof metadata.lastUserQuestion === 'string' && metadata.lastUserQuestion.trim()
      ? metadata.lastUserQuestion.trim()
      : null;
  const chartLabel =
    typeof metadata.chartLabel === 'string' && metadata.chartLabel.trim()
      ? metadata.chartLabel.trim()
      : null;

  return {
    threadTitle,
    threadTheme,
    lastUserQuestion,
    chartLabel,
    selectedYear,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const database = db();

    // If chatId provided → return messages for that chat
    if (chatId) {
      // Verify ownership
      const [chatRecord] = await database
        .select()
        .from(chat)
        .where(
          and(
            eq(chat.id, chatId),
            eq(chat.userId, user.id),
            eq(chat.model, 'ask-chart')
          )
        );

      if (!chatRecord) {
        return NextResponse.json(
          { error: 'Chat not found' },
          { status: 404 }
        );
      }

      const messages = await database
        .select({
          id: chatMessage.id,
          role: chatMessage.role,
          parts: chatMessage.parts,
          createdAt: chatMessage.createdAt,
        })
        .from(chatMessage)
        .where(
          and(
            eq(chatMessage.chatId, chatId),
            eq(chatMessage.status, 'active')
          )
        )
        .orderBy(chatMessage.createdAt);

      // Strip internals, return clean messages
      const cleaned = messages.map((m: { id: string; role: string; parts: string | null; createdAt: Date | null }) => {
        const parsed = JSON.parse(m.parts || '[]');
        return {
          id: m.id,
          role: m.role,
          content: parsed[0]?.text || '',
          createdAt: m.createdAt,
        };
      });

      return NextResponse.json({
        success: true,
        data: { chat: chatRecord, messages: cleaned },
      });
    }

    // No chatId → return list of ask-chart conversations
    const chats = await database
      .select({
        id: chat.id,
        title: chat.title,
        metadata: chat.metadata,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })
      .from(chat)
      .where(
        and(
          eq(chat.userId, user.id),
          eq(chat.model, 'ask-chart'),
          eq(chat.status, 'active')
        )
      )
      .orderBy(desc(chat.updatedAt))
      .limit(50);

    const threadChats = chats.map((chatRecord: (typeof chats)[number]) => {
      const metadata = parseChatMetadata(chatRecord.metadata);
      const presentation = getThreadPresentation(metadata, chatRecord.title);

      return {
        id: chatRecord.id,
        title: presentation.threadTitle,
        threadTitle: presentation.threadTitle,
        threadTheme: presentation.threadTheme,
        lastUserQuestion: presentation.lastUserQuestion,
        chartLabel: presentation.chartLabel,
        selectedYear: presentation.selectedYear,
        createdAt: chatRecord.createdAt,
        updatedAt: chatRecord.updatedAt,
      };
    });

    return NextResponse.json({ success: true, data: threadChats });
  } catch (error) {
    console.error('Ask chart history error:', error);
    return NextResponse.json(
      { error: 'Failed to load history' },
      { status: 500 }
    );
  }
}

// ── DELETE: Remove a chat and its messages ──
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return NextResponse.json({ error: 'Auth required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'chatId required' }, { status: 400 });
    }

    const database = db();

    // Verify ownership
    const [chatRecord] = await database
      .select()
      .from(chat)
      .where(
        and(
          eq(chat.id, chatId),
          eq(chat.userId, user.id),
          eq(chat.model, 'ask-chart')
        )
      );

    if (!chatRecord) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Soft-delete: mark chat and messages as deleted
    await database
      .update(chat)
      .set({ status: 'deleted' })
      .where(eq(chat.id, chatId));

    await database
      .update(chatMessage)
      .set({ status: 'deleted' })
      .where(eq(chatMessage.chatId, chatId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: 'Failed to delete' },
      { status: 500 }
    );
  }
}
