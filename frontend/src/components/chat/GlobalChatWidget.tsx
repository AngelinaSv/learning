import { MessageSquare, SendHorizonal, Wifi, WifiOff, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useGlobalChatSocket } from '../../hooks/useGlobalChatSocket';
import { cn, formatTime } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

export function GlobalChatWidget() {
  const { messages, status, error, currentUserId, sendMessage } = useGlobalChatSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [lastSeenCount, setLastSeenCount] = useState(messages.length);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = useMemo(() => {
    if (isOpen) return 0;
    return Math.max(0, messages.length - lastSeenCount);
  }, [isOpen, lastSeenCount, messages.length]);

  useEffect(() => {
    if (!isOpen) return;
    setLastSeenCount(messages.length);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isOpen, messages.length]);

  const send = (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();

    if (!message || status !== 'connected') return;

    sendMessage(message);
    setDraft('');
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-lg border border-plasma/40 bg-[#160b24]/95 text-white shadow-glow backdrop-blur-xl transition hover:border-plasma hover:bg-plasma/20"
        aria-label="Open global chat"
        title="Global Chat"
      >
        <MessageSquare className="h-6 w-6 text-plasma" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-plasma px-1.5 text-xs font-black text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <section className="fixed bottom-4 right-4 z-50 grid h-[min(34rem,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-sm grid-rows-[auto_1fr_auto] overflow-hidden rounded-lg border border-white/10 bg-[#12091f]/95 text-white shadow-[0_18px_60px_rgba(0,0,0,0.48),0_0_32px_rgba(255,59,212,0.18)] backdrop-blur-xl">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-black tracking-normal">Global Chat</h2>
          <Badge variant={status === 'connected' ? 'success' : status === 'connecting' ? 'secondary' : 'danger'} className="mt-1">
            {status === 'connected' ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
            {status}
          </Badge>
        </div>
        <Button variant="outline" size="icon" onClick={() => setIsOpen(false)} aria-label="Close global chat" title="Close">
          <X className="h-4 w-4" />
        </Button>
      </header>

      <ScrollArea className="min-h-0">
        <div className="space-y-3 p-4">
          {error ? (
            <div className="rounded-lg border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
          ) : null}

          {messages.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-sm text-slate-500">
              No messages yet.
            </div>
          ) : (
            messages.map((message) => {
              const mine = Boolean(message.senderId && message.senderId === currentUserId);

              return (
                <div key={message.id} className={cn('flex', mine && 'justify-end')}>
                  <div
                    className={cn(
                      'max-w-[86%] rounded-lg border px-3 py-2',
                      message.system
                        ? 'border-white/10 bg-white/[0.03] text-slate-400'
                        : mine
                          ? 'border-plasma/35 bg-plasma/15'
                          : 'border-white/10 bg-[#211033]/90',
                    )}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-white">{message.senderUsername || (message.system ? 'System' : 'Player')}</span>
                      <span className="font-mono text-[11px] text-slate-500">{formatTime(message.timestamp)}</span>
                    </div>
                    <p className="break-words text-sm leading-5 text-slate-100">{message.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <form onSubmit={send} className="flex gap-2 border-t border-white/10 bg-black/20 p-3">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={status === 'connected' ? 'Message global...' : 'Waiting for connection'}
          disabled={status !== 'connected'}
        />
        <Button type="submit" disabled={!draft.trim() || status !== 'connected'} aria-label="Send message">
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </section>
  );
}
