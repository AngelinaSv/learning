import { ScrollArea } from '../ui/scroll-area';

export interface GameLogEntry {
  id: string;
  time: string;
  message: string;
  tone?: 'default' | 'success' | 'danger' | 'muted';
}

const toneClass = {
  default: 'text-slate-200',
  success: 'text-green-200',
  danger: 'text-red-200',
  muted: 'text-slate-500',
};

export function GameLog({ entries, empty = 'No events yet.' }: { entries: GameLogEntry[]; empty?: string }) {
  return (
    <ScrollArea className="h-64 rounded-md border border-white/10 bg-black/20">
      <div className="space-y-3 p-4">
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">{empty}</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-[3.5rem_1fr] gap-3 text-sm">
              <span className="font-mono text-xs text-slate-500">{entry.time}</span>
              <p className={toneClass[entry.tone ?? 'default']}>{entry.message}</p>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
