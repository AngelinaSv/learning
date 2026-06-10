import { SendHorizonal, Wifi, WifiOff } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ErrorState } from '../components/shared/ErrorState';
import { NeonButton } from '../components/shared/NeonButton';
import { NeonCard } from '../components/shared/NeonCard';
import { PageShell } from '../components/layout/PageShell';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { useGlobalChatSocket } from '../hooks/useGlobalChatSocket';
import { cn, formatTime } from '../lib/utils';

export function ChatPage() {
  const { messages, status, error, currentUserId, sendMessage } = useGlobalChatSocket();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || status !== 'connected') return;
    sendMessage(message);
    setDraft('');
  };

  return (
    <PageShell
      eyebrow="Chat"
      title="Global Chat"
      description="Realtime room chat with reconnect feedback and automatic global room join."
      actions={
        <Badge variant={status === 'connected' ? 'success' : status === 'connecting' ? 'secondary' : 'danger'}>
          {status === 'connected' ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
          {status}
        </Badge>
      }
    >
      {error ? <ErrorState message={error} /> : null}

      <NeonCard className="grid min-h-[calc(100vh-15rem)] grid-rows-[1fr_auto] overflow-hidden">
        <ScrollArea className="h-[calc(100vh-21rem)] min-h-96">
          <div className="space-y-4 p-5">
            {messages.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-sm text-slate-500">
                No messages yet.
              </div>
            ) : (
              messages.map((message) => {
                const mine = message.senderId && message.senderId === currentUserId;

                return (
                  <div key={message.id} className={cn('flex items-end gap-3', mine && 'justify-end')}>
                    {!mine ? (
                      <Avatar>
                        <AvatarFallback>{(message.senderUsername || 'S').slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    ) : null}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg border px-4 py-3',
                        message.system
                          ? 'border-white/10 bg-white/[0.03] text-slate-400'
                          : mine
                            ? 'border-plasma/35 bg-plasma/15'
                            : 'border-white/10 bg-[#211033]/80',
                      )}
                    >
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white">{message.senderUsername || (message.system ? 'System' : 'Player')}</span>
                        <span className="font-mono text-[11px] text-slate-500">{formatTime(message.timestamp)}</span>
                      </div>
                      <p className="break-words text-sm leading-6 text-slate-100">{message.message}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <form onSubmit={send} className="flex gap-3 border-t border-white/10 bg-black/20 p-4">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={status === 'connected' ? 'Message global...' : 'Waiting for connection'}
            disabled={status !== 'connected'}
          />
          <NeonButton type="submit" disabled={!draft.trim() || status !== 'connected'} aria-label="Send message">
            <SendHorizonal className="h-4 w-4" />
            Send
          </NeonButton>
        </form>
      </NeonCard>
    </PageShell>
  );
}
