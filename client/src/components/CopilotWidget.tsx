import { useState } from 'react';
import { ChatCircleDots, PaperPlaneRight, X } from '@phosphor-icons/react';
import { api } from '../lib/api';

interface Message { role: 'user' | 'assistant'; text: string; }

const SUGGESTIONS = [
  'Which cargo is at highest risk?',
  'Which shipments have customs readiness issues?',
  'Show abnormal freight quotations.',
  'What can potentially be recovered?',
];

export function CopilotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "I'm CargoXense Copilot. I only answer using live shipment data — ask me about risk, customs, freight pricing, or recovery." },
  ]);

  const ask = async (query: string) => {
    if (!query.trim() || busy) return;
    setMessages((m) => [...m, { role: 'user', text: query }]);
    setInput('');
    setBusy(true);
    try {
      const res = await api.askCopilot(query);
      setMessages((m) => [...m, { role: 'assistant', text: res.answer }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: import.meta.env.DEV
        ? 'Could not reach the CargoXense server. Is it running on port 4000?'
        : 'Could not reach the CargoXense server. Please try again in a moment.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full border border-brand/50 bg-panel text-brand shadow-float transition hover:bg-brand hover:text-bg"
        aria-label="Open CargoXense Copilot"
      >
        {open ? <X size={22} weight="regular" /> : <ChatCircleDots size={24} weight="regular" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-30 flex h-[28rem] w-96 max-w-[calc(100vw-3rem)] flex-col rounded-lg border border-border bg-panel shadow-float">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <ChatCircleDots size={18} weight="regular" className="text-brand" />
            <div>
              <div className="font-display text-base font-medium">CargoXense Copilot</div>
              <div className="font-mono-ui text-[10px] uppercase tracking-[0.06em] text-muted">Grounded in live application state · no data invented</div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3" role="log" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === 'user' ? 'text-right' : ''}`}>
                <span className={`inline-block max-w-[85%] rounded-md px-3 py-2 text-left ${
                  m.role === 'user' ? 'bg-brand-soft text-text' : 'bg-panel-2 text-text'
                }`}>
                  {m.text}
                </span>
              </div>
            ))}
            {busy && <div className="font-mono-ui text-xs text-muted">Copilot is checking live data…</div>}
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="rounded-full border border-border-soft px-2.5 py-1 font-mono-ui text-[9px] uppercase tracking-[0.02em] text-muted hover:border-brand/40 hover:text-text">
                  {s}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about risk, customs, freight…"
                aria-label="Ask CargoXense Copilot a question"
                className="flex-1 rounded-sm border border-border bg-panel-2 px-3 py-2 text-sm outline-none focus:border-brand/50"
              />
              <button type="submit" disabled={busy} className="flex items-center gap-1.5 rounded-sm bg-brand px-3 py-2 font-mono-ui text-xs font-medium uppercase text-bg disabled:opacity-50">
                Ask <PaperPlaneRight size={12} weight="bold" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
