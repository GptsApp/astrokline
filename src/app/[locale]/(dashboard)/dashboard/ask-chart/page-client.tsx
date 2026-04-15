'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, MessageCircle, Plus, Sparkles, ArrowUpCircle, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Heading } from '@/components/astrocurve/ui/heading';
import { useCheckout } from '@/components/astrocurve/checkout/checkout-context';
import { normalizeCheckoutSource } from '@/components/astrocurve/checkout/checkout-copy';
import { AskChartThreadLoading } from '@/components/astrocurve/kline/ask-chart-thread-loading';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import ReactMarkdown from 'react-markdown';

import {
  ASK_CHART_LOADING_STEPS,
  buildAskChartAssistantMessage,
  buildAskChartErrorMessage,
  buildAskChartLoadingMessage,
  buildAskChartUserMessage,
  buildShorterAskChartQuestion,
  classifyAskChartError,
  replaceLastAssistantMessage,
  toAskChartRequestMessages,
  type AskChartMessage,
} from '@/lib/astrokline/ask-chart-client';
import {
  ASK_CHART_HISTORY_LIST_CACHE_KEY,
  DASHBOARD_KLINE_LIST_CACHE_KEY,
  invalidateClientRequestCache,
  runClientRequest,
} from '@/lib/astrokline/client-request-cache';
import { trackEvent } from '@/lib/astrokline/track-event';
import { toAppTier, tierAtLeast } from '@/lib/astrokline/tier-utils';
import { completeOnboardingStep } from '@/components/astrocurve/dashboard/onboarding-guide';

interface ChatItem {
  id: string;
  title: string;
  threadTitle: string;
  threadTheme: string | null;
  lastUserQuestion: string | null;
  chartLabel: string | null;
  selectedYear: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface ChatGroup {
  label: string;
  items: ChatItem[];
}

export function AskChartDashboard({ userTier }: { userTier: string }) {
  const tier = toAppTier(userTier);
  const canUse = tierAtLeast(tier, 'LITE');
  const { openCheckout } = useCheckout();
  const searchParams = useSearchParams();

  const openAskCheckout = useCallback((tierName: 'lite' | 'pro', source: 'ask_chart' | 'ask_chart_failure' | 'ask_chart_limit') => {
    const normalizedSource = normalizeCheckoutSource(source);
    trackEvent('pricing_modal_open', {
      source: normalizedSource,
    });
    openCheckout(tierName, normalizedSource);
  }, [openCheckout]);

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<AskChartMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [revisitPending, setRevisitPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resumeSurfaceShownRef = useRef(false);
  const resumeAutoOpenedRef = useRef<string | null>(null);
  const pendingChatLoadRef = useRef<string | null>(null);
  const chatMessagesCacheRef = useRef<Map<string, AskChartMessage[]>>(new Map());

  const resumeChatId = searchParams.get('chatId');
  const distinctChartLabels = Array.from(new Set(chats.map((chat) => chat.chartLabel).filter(Boolean)));
  const groupingMode = distinctChartLabels.length > 1 ? 'chart' : 'theme';
  const chatGroups = chats.reduce<ChatGroup[]>((groups, chat) => {
    const label = groupingMode === 'chart'
      ? chat.chartLabel || 'This chart'
      : chat.threadTheme || chat.chartLabel || 'Recent threads';
    const existingGroup = groups.find((group) => group.label === label);

    if (existingGroup) {
      existingGroup.items.push(chat);
      return groups;
    }

    groups.push({ label, items: [chat] });
    return groups;
  }, []);
  const loadingChat = chats.find((chat) => chat.id === loadingChatId);

  // Load profile
  useEffect(() => {
    let cancelled = false;

    runClientRequest(
      DASHBOARD_KLINE_LIST_CACHE_KEY,
      async () => {
        const response = await fetch('/api/kline/list');
        return response.json();
      },
      { ttlMs: 10_000 }
    ).then((data) => {
      if (cancelled) {
        return;
      }

      if (data.success && data.data?.[0]?.klineResult?.profile) {
        setProfile(data.data[0].klineResult.profile);
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  // Load chat list
  useEffect(() => {
    if (!canUse) { setIsLoadingChats(false); return; }
    let cancelled = false;

    runClientRequest(
      ASK_CHART_HISTORY_LIST_CACHE_KEY,
      async () => {
        const response = await fetch('/api/astrology/ask-chart/history');
        if (!response.ok) {
          throw new Error('history list failed');
        }

        return response.json();
      },
      { ttlMs: 10_000 }
    )
      .then(data => {
        if (cancelled) {
          return;
        }

        if (data.success) {
          setChats(data.data || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setIsLoadingChats(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canUse]);

  useEffect(() => {
    if (resumeSurfaceShownRef.current || chats.length === 0) {
      return;
    }

    trackEvent('thread_resume_shown', {
      source: 'ask_page',
      groupMode: groupingMode,
      chatCount: chats.length,
    });
    resumeSurfaceShownRef.current = true;
  }, [chats.length, groupingMode]);

  const loadChat = useCallback(async (chatId: string, source: 'ask_page_sidebar' | 'kline_continue_section' = 'ask_page_sidebar') => {
    if (pendingChatLoadRef.current === chatId) {
      return;
    }

    const restoredChat = chats.find((chat) => chat.id === chatId);
    const cachedMessages = chatMessagesCacheRef.current.get(chatId);

    if (cachedMessages?.length) {
      setActiveChatId(chatId);
      setMessages(cachedMessages);
      setLimitReached(false);
      setLoadingChatId(null);
      setRevisitPending(true);

      trackEvent('thread_resume_opened', {
        source,
        threadTheme: restoredChat?.threadTheme ?? 'unknown',
        selectedYear: restoredChat?.selectedYear ?? 'none',
      });
      return;
    }

    pendingChatLoadRef.current = chatId;
    setLoadingChatId(chatId);
    setActiveChatId(chatId);
    setMessages([]);
    setLimitReached(false);
    try {
      const res = await fetch(`/api/astrology/ask-chart/history?chatId=${chatId}`);
      if (!res.ok) {
        throw new Error('load chat failed');
      }
      const data = await res.json();
      if (data.success && data.data.messages) {
        const restoredMessages = data.data.messages.map((m: any) => ({ role: m.role, content: m.content, state: 'complete' }));
        chatMessagesCacheRef.current.set(chatId, restoredMessages);
        setMessages(restoredMessages);
        setRevisitPending(restoredMessages.length > 0);

        trackEvent('thread_resume_opened', {
          source,
          threadTheme: restoredChat?.threadTheme ?? 'unknown',
          selectedYear: restoredChat?.selectedYear ?? 'none',
        });
      }
    } catch {}
    finally {
      if (pendingChatLoadRef.current === chatId) {
        pendingChatLoadRef.current = null;
      }
      setLoadingChatId((currentChatId) => currentChatId === chatId ? null : currentChatId);
    }
  }, [chats]);

  useEffect(() => {
    if (
      !resumeChatId ||
      !canUse ||
      isLoadingChats ||
      activeChatId === resumeChatId ||
      resumeAutoOpenedRef.current === resumeChatId
    ) {
      return;
    }

    if (!chats.some((chat) => chat.id === resumeChatId)) {
      return;
    }

    resumeAutoOpenedRef.current = resumeChatId;
    void loadChat(resumeChatId, 'kline_continue_section');
  }, [activeChatId, canUse, chats, isLoadingChats, loadChat, resumeChatId]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStage(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStage((currentStage) => Math.min(currentStage + 1, ASK_CHART_LOADING_STEPS.length - 1));
    }, 1200);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!activeChatId || messages.length === 0 || isLoading) {
      return;
    }

    const hasTransientMessage = messages.some((message) => message.state === 'loading');
    if (hasTransientMessage) {
      return;
    }

    chatMessagesCacheRef.current.set(activeChatId, messages);
  }, [activeChatId, isLoading, messages]);

  const handleSend = async (text: string) => {
    const q = text.trim();
    if (!q || isLoading || limitReached) return;

    const shouldTrackRevisitConversion = revisitPending && Boolean(activeChatId);

    const userMsg = buildAskChartUserMessage(q);
    const requestMessages = [...toAskChartRequestMessages(messages), { role: userMsg.role, content: userMsg.content }];
    const newMsgs = [...messages, userMsg, buildAskChartLoadingMessage(q)];
    setMessages(newMsgs);
    setIsLoading(true);
    setLoadingStage(0);
    setLimitReached(false);
    if (shouldTrackRevisitConversion) {
      trackEvent('thread_resume_completed', {
        source: 'ask_page',
      });
      trackEvent('thread_revisit_conversion', {
        source: 'ask_page',
      });
    }
    setRevisitPending(false);

    try {
      const res = await fetch('/api/astrology/ask-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeChatId,
          profile,
          messages: requestMessages,
        }),
      });

      if (!res.ok || !res.body) {
        const errorType = classifyAskChartError(res.status);
        if (errorType === 'limit' || errorType === 'upgrade') {
          setLimitReached(true);
        }
        setMessages((previousMessages) =>
          replaceLastAssistantMessage(previousMessages, buildAskChartErrorMessage(errorType, q))
        );
        return;
      }

      completeOnboardingStep('ask_chart');
      invalidateClientRequestCache(ASK_CHART_HISTORY_LIST_CACHE_KEY);
      const newChatId = res.headers.get('X-Chat-Id');
      if (newChatId && !activeChatId) {
        setActiveChatId(newChatId);
        const now = new Date().toISOString();
        setChats(prev => [{
          id: newChatId,
          title: q.slice(0, 60),
          threadTitle: q.slice(0, 60),
          threadTheme: null,
          lastUserQuestion: q,
          chartLabel: profile?.name || null,
          selectedYear: null,
          createdAt: now,
          updatedAt: now,
        }, ...prev]);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((previousMessages) =>
          replaceLastAssistantMessage(previousMessages, buildAskChartAssistantMessage(assistantText))
        );
      }
      assistantText += decoder.decode();
      if (!assistantText.trim()) {
        setMessages((previousMessages) =>
          replaceLastAssistantMessage(previousMessages, buildAskChartErrorMessage('ai_unavailable', q))
        );
        return;
      }

      setMessages((previousMessages) =>
        replaceLastAssistantMessage(previousMessages, buildAskChartAssistantMessage(assistantText))
      );
    } catch {
      setMessages((previousMessages) =>
        replaceLastAssistantMessage(previousMessages, buildAskChartErrorMessage('network', q))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (question: string) => {
    handleSend(question);
  };

  const handleShorterRetry = (question: string) => {
    handleSend(buildShorterAskChartQuestion(question));
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setLimitReached(false);
    setLoadingChatId(null);
    setRevisitPending(false);
    inputRef.current?.focus();
  };

  const handleDeleteChat = async (chatIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    try {
      const res = await fetch(`/api/astrology/ask-chart/history?chatId=${chatIdToDelete}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error('delete chat failed');
      }
      invalidateClientRequestCache(ASK_CHART_HISTORY_LIST_CACHE_KEY);
      chatMessagesCacheRef.current.delete(chatIdToDelete);
      setChats(prev => prev.filter(c => c.id !== chatIdToDelete));
      if (activeChatId === chatIdToDelete) {
        setActiveChatId(null);
        setMessages([]);
        setLoadingChatId(null);
        setRevisitPending(false);
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
        <button onClick={() => openAskCheckout('lite', 'ask_chart')} className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-6 py-2 text-sm text-[#D4AF37] font-bold hover:bg-[#D4AF37]/20 transition-all">Unlock with Lite Plan</button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-white/5 bg-[#0c0c18]">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 shrink-0 flex-col border-r border-white/5 bg-[#0a0a16]">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Conversations</span>
          <button onClick={handleNewChat} title="Start a new conversation" aria-label="Start a new conversation" className="text-white/30 hover:text-[#D4AF37] p-1 rounded hover:bg-white/5 transition-colors"><Plus className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="flex items-center justify-center py-8"><div className="border-t-[#D4AF37] h-5 w-5 animate-spin rounded-full border-2 border-white/10" /></div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-xs text-white/20">No conversations yet</div>
          ) : chatGroups.map((group) => (
            <div key={group.label} className="border-b border-white/[0.03] last:border-b-0">
              <div className="sticky top-0 z-10 border-b border-white/[0.03] bg-[#0a0a16] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                {group.label}
              </div>
              {group.items.map((chat) => {
                const metaLabel = groupingMode === 'chart'
                  ? chat.threadTheme || 'Recent thread'
                  : chat.chartLabel || 'This chart';
                const activityDate = chat.updatedAt || chat.createdAt;

                return (
                  <div key={chat.id} className={cn("group relative border-b border-white/[0.03] transition-colors last:border-b-0", activeChatId === chat.id ? "bg-[#D4AF37]/5 border-l-2 border-l-[#D4AF37]/50" : "hover:bg-white/[0.03]") }>
                    <button onClick={() => loadChat(chat.id)} className="w-full px-4 py-3 text-left text-xs">
                      <div className={cn("truncate font-medium pr-6", activeChatId === chat.id ? "text-white/80" : "text-white/40 group-hover:text-white/60")}>{chat.threadTitle || chat.title || 'Untitled'}</div>
                      <div className="mt-1 truncate text-[10px] uppercase tracking-[0.14em] text-[#D4AF37]/60">{metaLabel}</div>
                      {chat.lastUserQuestion ? (
                        <div className="mt-1 line-clamp-2 pr-6 text-[11px] leading-5 text-white/28">{chat.lastUserQuestion}</div>
                      ) : null}
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-white/20"><Clock className="h-2.5 w-2.5" />{activityDate ? new Date(activityDate).toLocaleDateString() : 'Recently updated'}</div>
                    </button>
                    <button onClick={e => handleDeleteChat(chat.id, e)} className="absolute right-2 top-3 p-1.5 text-white/0 group-hover:text-white/20 hover:!text-red-400/70 transition-colors" title="Delete">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
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
              {loadingChatId ? (
                <AskChartThreadLoading
                  threadTitle={loadingChat?.threadTitle || loadingChat?.title}
                  questionPreview={loadingChat?.lastUserQuestion}
                />
              ) : (
                <>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10">
                    <Sparkles className="h-6 w-6 text-[#D4AF37]/50" />
                  </div>
                  <Heading level={3} className="mb-2 text-lg font-bold text-white/70">Start a Conversation</Heading>
                  <p className="mb-8 max-w-xs text-xs text-white/30">Powered by evolutionary astrology AI</p>
                </>
              )}
              {!loadingChatId && (
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
                      message: msg.content || ' ',
                      direction: msg.role === 'user' ? 'outgoing' : 'incoming',
                      position: 'single',
                    }}
                  >
                    {msg.role === 'assistant' && (
                      <Message.CustomContent>
                        {msg.state === 'loading' ? (
                          <div className="rounded-xl border border-[#D4AF37]/15 bg-[#D4AF37]/[0.05] px-4 py-3 text-left text-[13px] text-white/75">
                            <div className="flex items-center gap-2 text-[#D4AF37]">
                              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                              <span className="text-xs font-semibold uppercase tracking-[0.16em]">AstroCurve is working</span>
                            </div>
                            <p className="mt-2 text-sm text-white/80">{ASK_CHART_LOADING_STEPS[loadingStage]}</p>
                            <p className="mt-2 text-xs text-white/40">Your answer should start within a few seconds.</p>
                          </div>
                        ) : msg.state === 'error' ? (
                          <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.05] px-4 py-3 text-left text-[13px] text-white/75">
                            <div className="flex items-center gap-2 text-rose-300">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold uppercase tracking-[0.16em]">Answer interrupted</span>
                            </div>
                            <p className="mt-2 text-sm text-white/80">{msg.content}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {msg.errorType === 'limit' || msg.errorType === 'upgrade' ? (
                                <button
                                  type="button"
                                  onClick={() => openAskCheckout(tier === 'LITE' ? 'pro' : 'lite', msg.errorType === 'limit' ? 'ask_chart_limit' : 'ask_chart_failure')}
                                  className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-[11px] font-semibold text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/20"
                                >
                                  Upgrade to continue
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleRetry(msg.retryText || '')}
                                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/80 transition-colors hover:bg-white/10"
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                    Retry
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleShorterRetry(msg.retryText || '')}
                                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70 transition-colors hover:bg-white/10"
                                  >
                                    Try a shorter version
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="astro-md prose prose-sm prose-invert prose-p:my-1 prose-strong:text-white/90 max-w-none text-[13px] leading-relaxed text-white/75">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
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
            <button onClick={() => openAskCheckout(tier === 'LITE' ? 'pro' : 'lite', 'ask_chart_limit')} className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 py-3 text-[#D4AF37] text-sm font-bold hover:bg-[#D4AF37]/20 transition-all">
              <ArrowUpCircle className="h-4 w-4" />{tier === 'LITE' ? 'Upgrade to Pro — Unlimited' : 'Subscribe to Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
