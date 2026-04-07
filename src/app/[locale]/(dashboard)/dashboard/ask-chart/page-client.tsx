'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle, Plus, Send, Sparkles, ArrowUpCircle, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Heading } from '@/components/astrokline/ui/heading';
import { useCheckout } from '@/components/astrokline/checkout/checkout-context';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import ReactMarkdown from 'react-markdown';

interface Msg { role: 'user' | 'assistant'; content: string }
interface ChatItem { id: string; title: string; createdAt: string }

export function AskChartDashboard({ userTier }: { userTier: string }) {
  const tier = userTier === 'PREMIUM' ? 'PRO' : userTier === 'STANDARD' ? 'LITE' : 'FREE';
  const canUse = tier === 'PRO' || tier === 'LITE';
  const { openCheckout } = useCheckout();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load profile
  useEffect(() => {
    fetch('/api/kline/list').then(r => r.json()).then(data => {
      if (data.success && data.data?.[0]?.klineResult?.profile) setProfile(data.data[0].klineResult.profile);
    }).catch(() => {});
  }, []);

  // Load chat list
  useEffect(() => {
    if (!canUse) { setIsLoadingChats(false); return; }
    fetch('/api/astrology/ask-chart/history')
      .then(r => r.json())
      .then(data => { if (data.success) setChats(data.data || []); })
      .catch(() => {})
      .finally(() => setIsLoadingChats(false));
  }, [canUse]);

  const loadChat = useCallback(async (chatId: string) => {
    setActiveChatId(chatId);
    setMessages([]);
    setLimitReached(false);
    try {
      const res = await fetch(`/api/astrology/ask-chart/history?chatId=${chatId}`);
      const data = await res.json();
      if (data.success && data.data.messages) {
        setMessages(data.data.messages.map((m: any) => ({ role: m.role, content: m.content })));
      }
    } catch {}
  }, []);

  const handleSend = async (text: string) => {
    const q = text.trim();
    if (!q || isLoading || limitReached) return;

    const userMsg: Msg = { role: 'user', content: q };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setIsLoading(true);

    try {
      const res = await fetch('/api/astrology/ask-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeChatId,
          profile,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.status === 429 || res.status === 403) { setLimitReached(true); setIsLoading(false); return; }
      if (!res.ok || !res.body) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
        setIsLoading(false);
        return;
      }

      const newChatId = res.headers.get('X-Chat-Id');
      if (newChatId && !activeChatId) {
        setActiveChatId(newChatId);
        setChats(prev => [{ id: newChatId, title: q.slice(0, 60), createdAt: new Date().toISOString() }, ...prev]);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantText };
          return updated;
        });
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setLimitReached(false);
    inputRef.current?.focus();
  };

  const handleDeleteChat = async (chatIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    try {
      await fetch(`/api/astrology/ask-chart/history?chatId=${chatIdToDelete}`, { method: 'DELETE' });
      setChats(prev => prev.filter(c => c.id !== chatIdToDelete));
      if (activeChatId === chatIdToDelete) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch {}
  };

  if (!canUse) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-[#D4AF37]/10 border-[#D4AF37]/30 mb-4 flex h-16 w-16 items-center justify-center border rounded-2xl">
          <MessageCircle className="text-[#D4AF37] h-7 w-7" />
        </div>
        <Heading level={3} className="text-foreground mb-2 text-lg font-bold">Ask Your Chart</Heading>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">Have a conversation with your birth chart AI.</p>
        <button onClick={() => openCheckout('lite')} className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-6 py-2 text-sm text-[#D4AF37] font-bold hover:bg-[#D4AF37]/20 transition-all">Unlock with Lite Plan</button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-white/5" style={{ background: '#0c0c18' }}>
      {/* Sidebar */}
      <div className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/5" style={{ background: '#0a0a16' }}>
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Conversations</span>
          <button onClick={handleNewChat} className="text-white/30 hover:text-[#D4AF37] p-1 rounded hover:bg-white/5 transition-colors"><Plus className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="flex items-center justify-center py-8"><div className="border-t-[#D4AF37] h-5 w-5 animate-spin rounded-full border-2 border-white/10" /></div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-xs text-white/20">No conversations yet</div>
          ) : chats.map(c => (
            <div key={c.id} className={cn("group relative border-b border-white/[0.03] transition-colors", activeChatId === c.id ? "bg-[#D4AF37]/5 border-l-2 border-l-[#D4AF37]/50" : "hover:bg-white/[0.03]")}>
              <button onClick={() => loadChat(c.id)} className="w-full px-4 py-3 text-left text-xs">
                <div className={cn("truncate font-medium pr-6", activeChatId === c.id ? "text-white/80" : "text-white/40 group-hover:text-white/60")}>{c.title || 'Untitled'}</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-white/20"><Clock className="h-2.5 w-2.5" />{new Date(c.createdAt).toLocaleDateString()}</div>
              </button>
              <button onClick={e => handleDeleteChat(c.id, e)} className="absolute right-2 top-3 p-1.5 text-white/0 group-hover:text-white/20 hover:!text-red-400/70 transition-colors" title="Delete">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#D4AF37]" /><span className="text-sm font-bold text-white/80">Ask Your Chart</span></div>
          <button onClick={handleNewChat} className="text-[9px] text-white/30 font-mono uppercase tracking-wider">New</button>
        </div>

        <div className="flex-1 overflow-hidden astro-chat-scope">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
                <Sparkles className="h-6 w-6 text-[#D4AF37]/50" />
              </div>
              <Heading level={3} className="mb-2 text-lg font-bold text-white/70">{activeChatId ? 'Loading...' : 'Start a Conversation'}</Heading>
              <p className="mb-8 text-xs text-white/30 max-w-xs">Powered by evolutionary astrology AI</p>
              {!activeChatId && (
                <div className="w-full max-w-sm space-y-2">
                  {['Should I change jobs this year?', 'When is my best time for love?', 'What does 2027 hold for me?'].map(q => (
                    <button key={q} onClick={() => handleSend(q)} className="w-full rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3 text-left text-xs text-white/50 hover:border-[#D4AF37]/20 hover:text-white/70 hover:bg-[#D4AF37]/5 transition-all">{q}</button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ChatContainer>
              <MessageList
                typingIndicator={isLoading && messages[messages.length - 1]?.role === 'user'
                  ? <TypingIndicator content="Analyzing your chart..." />
                  : undefined
                }
              >
                {messages.map((msg, i) => (
                  <Message
                    key={i}
                    model={{
                      message: msg.content,
                      direction: msg.role === 'user' ? 'outgoing' : 'incoming',
                      position: 'single',
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <Message.CustomContent>
                        <div className="astro-md prose prose-sm prose-invert prose-p:my-1 prose-strong:text-white/90 max-w-none text-[13px] leading-relaxed text-white/75">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </Message.CustomContent>
                    )}
                  </Message>
                ))}
              </MessageList>
              <MessageInput
                placeholder="Ask your chart anything..."
                attachButton={false}
                onSend={(_innerHtml, textContent) => handleSend(textContent)}
                disabled={isLoading || limitReached}
              />
            </ChatContainer>
          )}
        </div>

        {/* Limit upgrade bar */}
        {limitReached && (
          <div className="border-t border-white/5 p-3">
            <button onClick={() => openCheckout(tier === 'LITE' ? 'pro' : 'lite')} className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 py-3 text-[#D4AF37] text-sm font-bold hover:bg-[#D4AF37]/20 transition-all">
              <ArrowUpCircle className="h-4 w-4" />{tier === 'LITE' ? 'Upgrade to Pro — Unlimited' : 'Subscribe to Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
