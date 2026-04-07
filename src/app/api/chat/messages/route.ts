import { respData, respErr } from '@/shared/lib/resp';
import { ChatStatus, getChats, getChatsCount } from '@/shared/models/chat';
import {
  getChatMessages,
  getChatMessagesCount,
} from '@/shared/models/chat_message';
import { getUserInfo } from '@/shared/models/user';

export async function POST(req: Request) {
  try {
    let { chatId, page, limit } = await req.json();
    if (!chatId) {
      return respErr('chatId is required');
    }

    page = Math.max(Math.floor(Number(page) || 1), 1);
    limit = Math.min(Math.max(Math.floor(Number(limit) || 30), 1), 100);

    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    const messages = await getChatMessages({
      chatId,
      page,
      limit,
    });
    const total = await getChatMessagesCount({
      chatId,
    });

    return respData({
      list: messages,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (e: any) {
    console.error('get chat messages failed:', e);
    return respErr('get chat messages failed');
  }
}
