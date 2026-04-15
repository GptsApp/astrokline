'use client';

import { useEffect, useRef, useState } from 'react';
import type { UserProfile } from '@/lib/astrokline/mock-astrology-data';
import { AlertCircle, Clock, Lock, MessageCircle, RefreshCw, Sparkles, Trash2, X, ChevronRight } from 'lucide-react';
import { getAskChartDepthBadges } from '@/lib/astrokline/depth-badges';
import {
  ASK_CHART_HISTORY_LIST_CACHE_KEY,
  invalidateClientRequestCache,
  runClientRequest,
} from '@/lib/astrokline/client-request-cache';
import { cn } from '@/shared/lib/utils';
import {
  ASK_CHART_LOADING_STEPS,
  type AskChartContextPrompt,
  buildAskChartAssistantMessage,
  buildAskChartErrorMessage,
  buildAskChartFollowUpPrompts,
  buildAskChartProofLines,
  buildAskChartLoadingMessage,
  buildAskChartUserMessage,
  buildShorterAskChartQuestion,
  classifyAskChartError,
  replaceLastAssistantMessage,
  toAskChartRequestMessages,
  type AskChartMessage,
} from '@/lib/astrokline/ask-chart-client';
import { trackEvent } from '@/lib/astrokline/track-event';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import ReactMarkdown from 'react-markdown';
import { AskChartThreadLoading } from '@/components/astrocurve/kline/ask-chart-thread-loading';

interface Props {
  profile: UserProfile;
  tier: string;
  onActionGate: (context?: string, tier?: string) => void;
  defaultPrompt?: AskChartContextPrompt | null;
  starterPrompts?: string[];
  externalOpen?: boolean;
  onExternalClose?: () => void;
  externalValidatePast?: boolean;
  externalPrompt?: AskChartContextPrompt | null;
}

interface RecentAskChat {
  id: string;
  title: string;
  threadTitle: string;
  threadTheme: string | null;
  lastUserQuestion: string | null;
  chartLabel: string | null;
  selectedYear: number | null;
  updatedAt: string | null;
}

const EXAMPLES = [
  'Should I change jobs this year?',
  'When is my best time for love?',
  'What\'s blocking my financial growth?',
  'Am I compatible with Scorpio?',
];

function isVerticallyScrollable(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  return /(auto|scroll|overlay)/.test(style.overflowY) && element.scrollHeight > element.clientHeight;
}

function findScrollableAncestor(startElement: HTMLElement | null, boundary: HTMLElement) {
  let currentElement = startElement;

  while (currentElement && currentElement !== boundary) {
    if (isVerticallyScrollable(currentElement)) {
      return currentElement;
    }

    currentElement = currentElement.parentElement;
  }

  return isVerticallyScrollable(boundary) ? boundary : null;
}

function shouldPreventPanelScrollChaining(
  target: HTMLElement | null,
  boundary: HTMLElement | null,
  deltaY: number,
  deltaX: number
) {
  if (Math.abs(deltaY) <= Math.abs(deltaX)) {
    return false;
  }

  if (!boundary || !target || !boundary.contains(target)) {
    return false;
  }

  const scrollableAncestor = findScrollableAncestor(target, boundary);
  if (!scrollableAncestor) {
    return true;
  }

  const maxScrollTop = scrollableAncestor.scrollHeight - scrollableAncestor.clientHeight;
  if (maxScrollTop <= 0) {
    return true;
  }

  const isScrollingUp = deltaY < 0;
  const isAtTop = scrollableAncestor.scrollTop <= 0;
  const isAtBottom = scrollableAncestor.scrollTop >= maxScrollTop - 1;

  return (isScrollingUp && isAtTop) || (!isScrollingUp && isAtBottom);
}

export function AskChartPanel({
  profile, tier, onActionGate, defaultPrompt, starterPrompts, externalOpen, onExternalClose, externalValidatePast, externalPrompt,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AskChartMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [composerText, setComposerText] = useState('');
  const [composerContextPrompt, setComposerContextPrompt] = useState<AskChartContextPrompt | null>(null);
  const [recentChats, setRecentChats] = useState<RecentAskChat[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [restoringChatId, setRestoringChatId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [restoredFromHistory, setRestoredFromHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [composerNeedsAttention, setComposerNeedsAttention] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const emptyStateScrollRef = useRef<HTMLDivElement>(null);
  const composerAttentionTimerRef = useRef<number | null>(null);
  const pendingValidateRef = useRef(false);
  const chatMessagesCacheRef = useRef<Map<string, AskChartMessage[]>>(new Map());

  const isPro = tier === 'PRO';
  const isLite = tier === 'LITE';
  const canUse = isPro || isLite;

  const syncPanelInteractionState = (options?: {
    focusComposer?: boolean;
    highlightComposer?: boolean;
    revealComposer?: boolean;
    scrollToBottom?: boolean;
  }) => {
    window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }

      const messageScrollWrappers = Array.from(
        panel.querySelectorAll<HTMLElement>('.cs-message-list__scroll-wrapper')
      );

      messageScrollWrappers.forEach((wrapper) => {
        wrapper.style.overscrollBehaviorY = 'contain';
      });

      if (emptyStateScrollRef.current) {
        emptyStateScrollRef.current.style.overscrollBehaviorY = 'contain';
      }

      if (options?.scrollToBottom) {
        const visibleScrollWrapper = messageScrollWrappers.find((wrapper) => {
          const rect = wrapper.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        if (visibleScrollWrapper) {
          visibleScrollWrapper.scrollTop = visibleScrollWrapper.scrollHeight;
        } else if (emptyStateScrollRef.current) {
          emptyStateScrollRef.current.scrollTop = emptyStateScrollRef.current.scrollHeight;
        }
      }

      const visibleComposerAnchor = Array.from(
        panel.querySelectorAll<HTMLElement>('.ask-chart-composer-anchor')
      ).find((anchor) => {
        const rect = anchor.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (options?.highlightComposer) {
        if (composerAttentionTimerRef.current) {
          window.clearTimeout(composerAttentionTimerRef.current);
        }

        setComposerNeedsAttention(true);
        composerAttentionTimerRef.current = window.setTimeout(() => {
          setComposerNeedsAttention(false);
          composerAttentionTimerRef.current = null;
        }, 1800);
      }

      if (options?.revealComposer) {
        visibleComposerAnchor?.scrollIntoView({
          behavior: options.highlightComposer ? 'smooth' : 'auto',
          block: 'nearest',
        });
      }

      if (!options?.focusComposer) {
        return;
      }

      const visibleComposer = Array.from(
        panel.querySelectorAll<HTMLDivElement>(
          '.cs-message-input__content-editor[contenteditable="true"]'
        )
      ).find((editor) => {
        const rect = editor.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (!visibleComposer) {
        return;
      }

      visibleComposerAnchor?.scrollIntoView({
        behavior: options.highlightComposer ? 'smooth' : 'auto',
        block: 'nearest',
      });

      visibleComposer.focus({ preventScroll: true });

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(visibleComposer);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
  };

  const handlePanelWheelCapture = (event: React.WheelEvent<HTMLDivElement>) => {
    if (
      shouldPreventPanelScrollChaining(
        event.target as HTMLElement | null,
        panelRef.current,
        event.deltaY,
        event.deltaX
      )
    ) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    return () => {
      if (composerAttentionTimerRef.current) {
        window.clearTimeout(composerAttentionTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const panel = panelRef.current;
    if (!panel) {
      return;
    }

    const handleNativeWheel = (event: WheelEvent) => {
      if (
        shouldPreventPanelScrollChaining(
          event.target as HTMLElement | null,
          panel,
          event.deltaY,
          event.deltaX
        )
      ) {
        event.preventDefault();
      }
    };

    panel.addEventListener('wheel', handleNativeWheel, {
      capture: true,
      passive: false,
    });

    return () => {
      panel.removeEventListener('wheel', handleNativeWheel, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (externalOpen && canUse) setIsOpen(true);
  }, [externalOpen, canUse]);

  useEffect(() => {
    if (!isOpen || !canUse) {
      return;
    }

    syncPanelInteractionState({
      focusComposer: messages.length === 0,
      scrollToBottom: messages.length > 0,
    });
  }, [isOpen, canUse]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    syncPanelInteractionState({
      focusComposer: Boolean(composerContextPrompt),
      highlightComposer: Boolean(composerContextPrompt),
      revealComposer: Boolean(composerContextPrompt),
      scrollToBottom: messages.length > 0,
    });
  }, [composerContextPrompt?.id, isOpen]);

  useEffect(() => {
    if (!isOpen || messages.length === 0) {
      return;
    }

    syncPanelInteractionState({ scrollToBottom: true });
  }, [messages.length, isOpen]);

  useEffect(() => {
    if (!isOpen || !canUse || messages.length > 0) {
      return;
    }

    let cancelled = false;

    const loadRecentChats = async () => {
      setIsLoadingHistory(true);
      setHistoryError(null);

      try {
        const data = await runClientRequest(
          ASK_CHART_HISTORY_LIST_CACHE_KEY,
          async () => {
            const response = await fetch('/api/astrology/ask-chart/history');
            if (!response.ok) {
              throw new Error('history list failed');
            }

            return response.json();
          },
          { ttlMs: 10_000 }
        );
        if (cancelled) {
          return;
        }

        const nextChats = Array.isArray(data.data)
          ? data.data.slice(0, 10).map((item: {
              id: string;
              title?: string | null;
              threadTitle?: string | null;
              threadTheme?: string | null;
              lastUserQuestion?: string | null;
              chartLabel?: string | null;
              selectedYear?: number | null;
              updatedAt?: string | null;
            }) => ({
              id: item.id,
              title: item.title?.trim() || 'Untitled conversation',
              threadTitle: item.threadTitle?.trim() || item.title?.trim() || 'Untitled conversation',
              threadTheme: item.threadTheme?.trim() || null,
              lastUserQuestion: item.lastUserQuestion?.trim() || null,
              chartLabel: item.chartLabel?.trim() || null,
              selectedYear: typeof item.selectedYear === 'number' ? item.selectedYear : null,
              updatedAt: item.updatedAt ?? null,
            }))
          : [];

        setRecentChats(nextChats);
        if (nextChats.length > 0) {
          trackEvent('thread_resume_shown', {
            source: 'floating_panel',
            count: nextChats.length,
          });
        }
      } catch {
        if (!cancelled) {
          setRecentChats([]);
          setHistoryError('Recent conversations are unavailable right now.');
        }
      } finally {
        if (!cancelled) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadRecentChats();

    return () => {
      cancelled = true;
    };
  }, [isOpen, canUse, messages.length]);

  useEffect(() => {
    if (!externalPrompt || !canUse) {
      return;
    }

    setIsOpen(true);

    if (chatId || messages.length > 0) {
      setChatId(null);
      setMessages([]);
      setLimitReached(false);
    }

    setComposerText(externalPrompt.text);
    setComposerContextPrompt(externalPrompt);
  }, [externalPrompt?.id, canUse]);

  useEffect(() => {
    if (!isOpen || !defaultPrompt || !canUse) {
      return;
    }

    if (chatId || messages.length > 0) {
      return;
    }

    if (composerContextPrompt?.id === defaultPrompt.id) {
      return;
    }

    if (composerText.trim().length > 0 && !composerContextPrompt) {
      return;
    }

    setComposerContextPrompt(defaultPrompt);

    if (!composerText.trim()) {
      setComposerText(defaultPrompt.text);
    }
  }, [
    canUse,
    chatId,
    composerContextPrompt,
    composerText,
    defaultPrompt,
    isOpen,
    messages.length,
  ]);

  // When externalValidatePast is triggered, open panel and queue the validate prompt
  useEffect(() => {
    if (externalValidatePast && canUse) {
      setIsOpen(true);
      setChatId(null);
      setMessages([]);
      setLimitReached(false);
      setComposerText('');
      setComposerContextPrompt(null);
      pendingValidateRef.current = true;
    }
  }, [externalValidatePast, canUse]);

  // Fire the validate prompt once panel is open and pending
  useEffect(() => {
    if (isOpen && pendingValidateRef.current && messages.length === 0 && !isLoading) {
      pendingValidateRef.current = false;
      handleSend("I want to verify a past event. Explain astrological transits that prove the inevitability of major life events that I experienced.");
    }
  }, [isOpen]);

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
    if (!chatId || messages.length === 0 || isLoading) {
      return;
    }

    const hasTransientMessage = messages.some((message) => message.state === 'loading');
    if (hasTransientMessage) {
      return;
    }

    chatMessagesCacheRef.current.set(chatId, messages);
  }, [chatId, isLoading, messages]);

  const handleClose = () => { setIsOpen(false); onExternalClose?.(); };

  const handleSend = async (text: string, sourcePromptOverride?: AskChartContextPrompt | null) => {
    const q = text.trim();
    if (!q || isLoading || limitReached) return;

    const sourcePrompt = sourcePromptOverride ?? composerContextPrompt;
    const shouldTrackRevisitConversion = restoredFromHistory && Boolean(chatId);

    const userMsg = buildAskChartUserMessage(q);
    const requestMessages = [...toAskChartRequestMessages(messages), { role: userMsg.role, content: userMsg.content }];
    const newMsgs = [...messages, userMsg, buildAskChartLoadingMessage(q)];
    setMessages(newMsgs);
    setIsLoading(true);
    setLoadingStage(0);
    setLimitReached(false);
    setComposerText('');
    if (shouldTrackRevisitConversion) {
      trackEvent('thread_resume_completed', {
        source: 'floating_panel',
      });
      trackEvent('thread_revisit_conversion', {
        source: 'floating_panel',
      });
    }
    setRestoredFromHistory(false);

    if (sourcePrompt) {
      trackEvent('result_context_ask_send', {
        sourceType: sourcePrompt.sourceType,
        sourceKey: sourcePrompt.sourceKey,
        selectedYear: sourcePrompt.selectedYear ?? 'none',
      });
    }

    try {
      const res = await fetch('/api/astrology/ask-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          profile,
          messages: requestMessages,
          context: sourcePrompt
            ? {
                sourceType: sourcePrompt.sourceType,
                sourceKey: sourcePrompt.sourceKey,
                selectedYear: sourcePrompt.selectedYear,
                promptLabel: sourcePrompt.label,
                promptText: sourcePrompt.text,
                contextSnippet: sourcePrompt.contextSnippet,
              }
            : undefined,
        }),
      });

      if (!res.ok || !res.body) {
        const errorType = classifyAskChartError(res.status);
        const upgradeSource = sourcePrompt?.sourceType === 'answer'
          ? 'module_followup_cta'
          : errorType === 'limit'
            ? 'ask_chart_limit'
            : errorType === 'upgrade'
              ? 'ask_chart_failure'
              : undefined;
        if (errorType === 'limit' || errorType === 'upgrade') {
          setLimitReached(true);
        }
        setMessages((previousMessages) =>
          replaceLastAssistantMessage(previousMessages, buildAskChartErrorMessage(errorType, q, upgradeSource))
        );
        return;
      }

      const newChatId = res.headers.get('X-Chat-Id');
      if (newChatId) setChatId(newChatId);

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

      const followUpPrompts = buildAskChartFollowUpPrompts(q, assistantText, sourcePrompt);
      const depthBadges = getAskChartDepthBadges(q, sourcePrompt, profile);
      const proofLines = buildAskChartProofLines(sourcePrompt, depthBadges);
      setMessages((previousMessages) =>
        replaceLastAssistantMessage(previousMessages, buildAskChartAssistantMessage(assistantText, followUpPrompts, depthBadges, proofLines))
      );

      if (sourcePrompt) {
        trackEvent('result_context_ask_success', {
          sourceType: sourcePrompt.sourceType,
          sourceKey: sourcePrompt.sourceKey,
          selectedYear: sourcePrompt.selectedYear ?? 'none',
        });
      }
      invalidateClientRequestCache(ASK_CHART_HISTORY_LIST_CACHE_KEY);
      setComposerContextPrompt(null);
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
    setChatId(null);
    setMessages([]);
    setLimitReached(false);
    setComposerText(defaultPrompt?.text ?? '');
    setComposerContextPrompt(defaultPrompt ?? null);
    setRestoringChatId(null);
    setRestoredFromHistory(false);
  };

  const handleValidatePast = () => {
    handleSend("I want to verify a past event. Explain astrological transits that prove the inevitability of major life events that I experienced.");
  };

  const handleRestoreChat = async (targetChatId: string) => {
    if (restoringChatId || isLoading) {
      return;
    }

    const restoredChat = recentChats.find((chat) => chat.id === targetChatId);
    const cachedMessages = chatMessagesCacheRef.current.get(targetChatId);

    if (cachedMessages?.length) {
      setChatId(targetChatId);
      setMessages(cachedMessages);
      setRestoredFromHistory(true);
      setHistoryError(null);
      setComposerText('');
      setComposerContextPrompt(null);
      setLimitReached(false);
      syncPanelInteractionState({ focusComposer: true, scrollToBottom: true });

      trackEvent('thread_resume_opened', {
        source: 'floating_panel',
        threadTheme: restoredChat?.threadTheme ?? 'unknown',
        selectedYear: restoredChat?.selectedYear ?? 'none',
      });
      return;
    }

    setRestoringChatId(targetChatId);
    setHistoryError(null);
    setComposerText('');
    setComposerContextPrompt(null);
    setLimitReached(false);

    try {
      const response = await fetch(`/api/astrology/ask-chart/history?chatId=${targetChatId}`);
      if (!response.ok) {
        throw new Error('history detail failed');
      }

      const data = await response.json();
      const restoredMessages = Array.isArray(data.data?.messages)
        ? data.data.messages.map((message: { role: 'user' | 'assistant'; content: string }) => ({
            role: message.role,
            content: message.content,
            state: 'complete' as const,
          }))
        : [];

      setChatId(targetChatId);
      setMessages(restoredMessages);
      setRestoredFromHistory(true);
      chatMessagesCacheRef.current.set(targetChatId, restoredMessages);
      syncPanelInteractionState({ focusComposer: true, scrollToBottom: true });

      trackEvent('thread_resume_opened', {
        source: 'floating_panel',
        threadTheme: restoredChat?.threadTheme ?? 'unknown',
        selectedYear: restoredChat?.selectedYear ?? 'none',
      });
    } catch {
      setChatId(null);
      setMessages([]);
      setHistoryError('Unable to restore that conversation.');
    } finally {
      setRestoringChatId(null);
    }
  };

  const handleDeleteChat = async (
    event: React.MouseEvent<HTMLButtonElement>,
    targetChatId: string
  ) => {
    event.stopPropagation();

    if (deletingChatId || restoringChatId) {
      return;
    }

    if (typeof window !== 'undefined' && !window.confirm('Delete this conversation?')) {
      return;
    }

    setDeletingChatId(targetChatId);
    setHistoryError(null);

    try {
      const response = await fetch(`/api/astrology/ask-chart/history?chatId=${targetChatId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('delete chat failed');
      }

      chatMessagesCacheRef.current.delete(targetChatId);
      invalidateClientRequestCache(ASK_CHART_HISTORY_LIST_CACHE_KEY);

      setRecentChats((previousChats) =>
        previousChats.filter((chat) => chat.id !== targetChatId)
      );
    } catch {
      setHistoryError('Unable to delete that conversation.');
    } finally {
      setDeletingChatId(null);
    }
  };

  const lastCompleteAssistantIndex = messages.reduce((lastIndex, message, index) => {
    if (message.role === 'assistant' && message.state === 'complete') {
      return index;
    }

    return lastIndex;
  }, -1);

  const shouldTopAlignEmptyState =
    Boolean(composerContextPrompt) ||
    Boolean(historyError) ||
    isLoadingHistory ||
    recentChats.length > 0;
  const examplePrompts = Array.from(new Set([...(starterPrompts ?? []), ...EXAMPLES])).slice(0, 4);
  const restoringChat = recentChats.find((chat) => chat.id === restoringChatId);

  const renderComposer = (options?: { withTopBorder?: boolean }) => (
    <div
      className={cn(
        'ask-chart-composer-anchor transition-[background-color,border-color,box-shadow] duration-300',
        options?.withTopBorder && 'border-t border-white/8',
        composerNeedsAttention && 'bg-[#D4AF37]/[0.03] shadow-[0_-14px_32px_rgba(212,175,55,0.14)]',
        composerNeedsAttention && options?.withTopBorder && 'border-[#D4AF37]/30'
      )}
    >
      <MessageInput
        value={composerText}
        placeholder="Ask your chart anything..."
        attachButton={false}
        sendDisabled={composerText.trim().length === 0}
        onChange={(_innerHtml, textContent) => setComposerText(textContent)}
        onSend={(_innerHtml, textContent) => handleSend(textContent)}
        disabled={isLoading || limitReached}
      />
    </div>
  );

  // ── Locked state ──
  if (!canUse) {
    return (
      <button onClick={() => onActionGate('ask_chart', 'LITE')} className="group hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 border border-white/10 bg-[#0A0A14]/90 px-4 py-3 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:border-[#D4AF37]/30 rounded-lg">
        <MessageCircle className="h-4 w-4 text-white/40 group-hover:text-[#D4AF37]" />
        <span className="text-xs font-bold text-white/50 group-hover:text-[#D4AF37]">Ask Your Chart</span>
        <Lock className="h-3 w-3 text-white/20" />
      </button>
    );
  }

  // ── Closed state ──
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);

          if (!chatId && messages.length === 0 && defaultPrompt) {
            setComposerText(defaultPrompt.text);
            setComposerContextPrompt(defaultPrompt);
          }
        }}
        className="group hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-3 shadow-[0_0_40px_rgba(212,175,55,0.15)] backdrop-blur-xl transition-all hover:bg-[#D4AF37]/20 hover:scale-105 rounded-lg"
      >
        <MessageCircle className="h-4 w-4 text-[#D4AF37]" />
        <span className="text-xs font-bold text-[#D4AF37]">Ask Your Chart</span>
      </button>
    );
  }

  // ── Open state ──
  return (
    <div className={cn(
      "fixed z-50 flex flex-col overflow-hidden overscroll-y-contain bg-[#0c0c18]",
      "inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:h-[620px] sm:w-[420px] sm:rounded-xl sm:border sm:border-white/10 sm:shadow-2xl"
    )} ref={panelRef} onWheelCapture={handlePanelWheelCapture}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/8 bg-[linear-gradient(135deg,_#0f0f1e_0%,_#141425_100%)] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/15">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
          </div>
          <span className="text-sm font-semibold text-white/90 tracking-tight">Ask Your Chart</span>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button onClick={handleNewChat} className="px-2.5 py-1 text-[10px] text-white/40 hover:text-[#D4AF37] font-medium uppercase tracking-wider rounded hover:bg-white/5 transition-colors">New</button>
          )}
          <button title="Close Ask Chart" aria-label="Close Ask Chart" onClick={handleClose} className="p-1.5 text-white/30 hover:text-white/60 rounded hover:bg-white/5 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 min-h-0 overflow-hidden astro-chat-scope">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-0 flex-col">
            <div ref={emptyStateScrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
              <div className={cn(
                'mx-auto flex min-h-full w-full max-w-sm flex-col p-6 text-center',
                shouldTopAlignEmptyState ? 'justify-start' : 'justify-center'
              )}>
                {restoringChatId ? (
                  <div className="flex min-h-full items-center justify-center py-8">
                    <AskChartThreadLoading
                      compact
                      threadTitle={restoringChat?.threadTitle}
                      questionPreview={restoringChat?.lastUserQuestion}
                    />
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center self-center rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10">
                      <MessageCircle className="h-6 w-6 text-[#D4AF37]/60" />
                    </div>
                    <p className="mb-1 text-sm font-semibold text-white/70">Ask anything about your chart</p>
                    <p className="mb-6 text-xs text-white/30">Powered by evolutionary astrology AI</p>
                    <div className="w-full space-y-2">
                      {examplePrompts.map(q => (
                        <button key={q} onClick={() => handleSend(q)} className="w-full rounded-lg border border-white/6 bg-white/[0.02] px-4 py-2.5 text-left text-xs text-white/50 hover:border-[#D4AF37]/20 hover:text-white/70 hover:bg-[#D4AF37]/5 transition-all">
                          {q}
                        </button>
                      ))}
                      <div className="pt-2">
                        <button onClick={handleValidatePast} className="group relative flex w-full items-center justify-between overflow-hidden rounded-lg border border-[#D4AF37]/30 border-dashed bg-[#D4AF37]/5 px-4 py-2.5 text-left text-xs font-bold text-[#D4AF37] transition-all hover:bg-[#D4AF37]/10">
                          <span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> Validate My Past</span>
                          <ChevronRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                    {historyError ? (
                      <p className="mt-4 text-[11px] text-rose-300/80">{historyError}</p>
                    ) : null}
                    {isLoadingHistory || recentChats.length > 0 ? (
                      <div className="mt-6 w-full border-t border-white/8 pt-4 text-left">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Continue a thread</span>
                          {isLoadingHistory ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border border-white/15 border-t-[#D4AF37]" />
                          ) : null}
                        </div>
                        <div className="max-h-64 space-y-2 overflow-y-auto overscroll-y-contain pr-1">
                          {recentChats.map((chat) => (
                            <div key={chat.id} className="relative rounded-lg border border-white/6 bg-white/[0.02] transition-all hover:border-[#D4AF37]/20 hover:bg-[#D4AF37]/5">
                              <button
                                type="button"
                                onClick={() => handleRestoreChat(chat.id)}
                                disabled={Boolean(restoringChatId) || Boolean(deletingChatId)}
                                className="w-full px-3 py-2.5 pr-10 text-left disabled:cursor-wait disabled:opacity-60"
                              >
                                <span className="block truncate text-xs font-medium text-white/72">{chat.threadTitle}</span>
                                {chat.threadTheme || chat.chartLabel ? (
                                  <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-[#D4AF37]/70">
                                    {[chat.chartLabel, chat.threadTheme].filter(Boolean).join(' / ')}
                                  </span>
                                ) : null}
                                {chat.lastUserQuestion ? (
                                  <span className="mt-1.5 block line-clamp-2 text-[10px] leading-relaxed text-white/34">
                                    {chat.lastUserQuestion}
                                  </span>
                                ) : null}
                                <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-white/28">
                                  <Clock className="h-2.5 w-2.5" />
                                  {restoringChatId === chat.id
                                    ? 'Restoring...'
                                    : chat.updatedAt
                                      ? new Date(chat.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                      : 'Recent'}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={(event) => handleDeleteChat(event, chat.id)}
                                disabled={Boolean(restoringChatId) || Boolean(deletingChatId)}
                                title="Delete conversation"
                                aria-label="Delete conversation"
                                className="absolute right-2 top-2 rounded p-1.5 text-white/20 transition-colors hover:bg-white/5 hover:text-rose-300 disabled:cursor-wait disabled:opacity-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            {renderComposer({ withTopBorder: true })}
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
                                onClick={() => onActionGate(msg.upgradeSource ?? (msg.errorType === 'limit' ? 'ask_chart_limit' : 'ask_chart_failure'), isLite ? 'PRO' : 'LITE')}
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
                          {msg.depthBadges?.length ? (
                            <div className="mb-3 flex flex-wrap gap-2 not-prose">
                              {msg.depthBadges.map((badge) => (
                                <button
                                  key={`${i}-${badge.id}`}
                                  type="button"
                                  onClick={() => isLite ? onActionGate('depth_badge_click', 'PRO') : undefined}
                                  className={cn(
                                    'inline-flex items-center border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em]',
                                    isLite
                                      ? 'border-[#D4AF37]/30 bg-[#D4AF37]/12 text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/20'
                                      : 'border-[#D4AF37]/20 bg-[#D4AF37]/8 text-[#D4AF37]/80'
                                  )}
                                >
                                  {badge.label}
                                </button>
                              ))}
                            </div>
                          ) : null}
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          {msg.proofLines?.length ? (
                            isLite ? (
                              <button
                                type="button"
                                onClick={() => onActionGate('proof_layer_open', 'PRO')}
                                className="mt-3 w-full rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/8 px-3 py-2.5 text-left text-[12px] text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/12"
                              >
                                <span className="font-semibold">Unlock the deeper logic behind this answer</span>
                                <span className="mt-1 block text-[11px] text-white/55">See the proof layer, advanced timing, and deeper chart evidence.</span>
                              </button>
                            ) : (
                              <details className="mt-3 not-prose border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[12px] text-white/72">
                                <summary className="cursor-pointer list-none font-semibold text-white/82">
                                  Why this answer?
                                </summary>
                                <div className="mt-3 space-y-2">
                                  {msg.proofLines.map((line) => (
                                    <p key={line} className="leading-relaxed text-white/65">
                                      {line}
                                    </p>
                                  ))}
                                </div>
                              </details>
                            )
                          ) : null}
                          {i === lastCompleteAssistantIndex && msg.followUpPrompts?.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {msg.followUpPrompts.map((prompt, promptIndex) => (
                                <button
                                  key={prompt}
                                  type="button"
                                  onClick={() => handleSend(prompt, {
                                    id: `answer-follow-up-${chatId ?? 'draft'}-${promptIndex}`,
                                    label: 'This answer',
                                    text: prompt,
                                    sourceType: 'answer',
                                    sourceKey: chatId ? `chat:${chatId}` : 'follow_up',
                                  })}
                                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/78 transition-colors hover:bg-white/10"
                                >
                                  {prompt}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </Message.CustomContent>
                  )}
                </Message>
              ))}
            </MessageList>
            {renderComposer()}
          </ChatContainer>
        )}
      </div>

      {composerContextPrompt ? (
        <div className="border-t border-white/8 bg-white/[0.02] px-4 py-2.5 text-[11px] text-white/55">
          <span className="font-mono uppercase tracking-[0.18em] text-[#D4AF37]/80">Draft from {composerContextPrompt.label}</span>
          <span className="ml-2 text-white/38">Edit or send below.</span>
        </div>
      ) : null}
    </div>
  );
}

export function InlineAskChartEntry({ tier, onActionGate, onOpenChat, onValidatePast }: { tier: string; onActionGate: (ctx?: string, tier?: string) => void; onOpenChat?: () => void; onValidatePast?: () => void }) {
  const canUse = tier === 'PRO' || tier === 'LITE';
  const statusText = tier === 'PRO'
    ? 'Unlimited AI chart chat'
    : tier === 'LITE'
      ? '3 AI questions available this month'
      : 'Lite: 3 questions/mo · Pro: unlimited';
  return (
    <div className="md:hidden w-full flex flex-col gap-2">
      <button onClick={() => canUse ? onOpenChat?.() : onActionGate('module_followup_cta', 'LITE')} className={cn("w-full flex items-center justify-between gap-3 px-5 py-4 border rounded-lg transition-all", canUse ? "border-[#D4AF37]/20 bg-[#D4AF37]/5 hover:border-[#D4AF37]/40" : "border-white/8 bg-white/[0.02] hover:border-white/15")}>
        <div className="flex items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border", canUse ? "border-[#D4AF37]/30 bg-[#D4AF37]/10" : "border-white/10 bg-white/5")}>
            <MessageCircle className={cn("h-4 w-4", canUse ? "text-[#D4AF37]" : "text-white/40")} />
          </div>
          <div className="text-left">
            <span className={cn("block text-sm font-bold", canUse ? "text-[#D4AF37]" : "text-white/60")}>Ask Your Chart</span>
            <span className="block text-[10px] text-white/30 mt-0.5">{statusText}</span>
          </div>
        </div>
        {canUse ? <ChevronRight className="h-4 w-4 text-[#D4AF37]/50" /> : <Lock className="h-3.5 w-3.5 text-white/20" />}
      </button>

      <button onClick={() => canUse ? onValidatePast?.() : onActionGate('validator', 'PRO')} className="w-full flex items-center justify-between gap-3 px-5 py-3 border border-[#D4AF37]/30 border-dashed rounded-lg bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 transition-all">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#D4AF37]" />
          <span className="text-xs font-bold text-[#D4AF37]">Validate My Past</span>
        </div>
        {!canUse && <Lock className="h-3.5 w-3.5 text-[#D4AF37]/50" />}
      </button>
    </div>
  );
}
