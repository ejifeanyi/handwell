'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './Icon';

export interface Option { value: string; label: string; hint?: string }

/** Accessible custom dropdown (listbox pattern): click or keyboard, typeahead, closes on outside click and Escape. */
export function Select({ value, onChange, options, label, ariaLabel, prefix, className = '', size = 'md', align = 'left' }: {
  value: string; onChange: (v: string) => void; options: Option[];
  label?: string; ariaLabel?: string; prefix?: string; className?: string; size?: 'md' | 'sm'; align?: 'left' | 'right';
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const selected = Math.max(0, options.findIndex((o) => o.value === value));
  const current = options[selected];

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);

  useEffect(() => { if (open) document.getElementById(`${id}-${active}`)?.scrollIntoView({ block: 'nearest' }); }, [open, active, id]);

  const openMenu = () => { setActive(selected); setOpen(true); };
  const pick = (i: number) => { const o = options[i]; if (o) onChange(o.value); setOpen(false); root.current?.querySelector('button')?.focus(); };

  function onKey(e: React.KeyboardEvent) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openMenu(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(options.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(active); }
    else if (e.key === 'Tab') setOpen(false);
    else if (e.key.length === 1) {
      const i = options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  }

  const pad = size === 'sm' ? 'px-3.5 py-2 text-sm' : 'px-4 py-3.5 text-base';
  return (
    <div className={`relative ${className}`} ref={root}>
      {label && <span id={`${id}-label`} className="mb-2 block text-sm font-semibold">{label}</span>}
      <button type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`}
        aria-labelledby={label ? `${id}-label` : undefined} aria-label={label ? undefined : ariaLabel}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())} onKeyDown={onKey}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border-[1.5px] bg-white text-left transition-colors ${open ? 'border-pine shadow-soft' : 'border-line hover:border-pine/60'} ${pad}`}>
        <span className="truncate">{prefix && <span className="mr-2 text-ink-soft">{prefix}</span>}<span className="font-medium">{current?.label ?? 'Select…'}</span></span>
        <Icon name="chevron" size={18} className={`shrink-0 text-ink-soft transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul id={`${id}-list`} role="listbox" tabIndex={-1} aria-labelledby={label ? `${id}-label` : undefined}
          className={`absolute z-30 mt-2 max-h-72 min-w-full overflow-auto rounded-2xl border border-line bg-white p-1.5 shadow-card ${align === 'right' ? 'right-0' : 'left-0'}`}>
          {options.map((o, i) => (
            <li key={o.value} id={`${id}-${i}`} role="option" aria-selected={o.value === value}
              onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(i)}
              className={`flex cursor-pointer items-center justify-between gap-6 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm ${i === active ? 'bg-sage' : ''} ${o.value === value ? 'font-semibold text-pine' : ''}`}>
              <span>{o.label}{o.hint && <span className="ml-2 text-xs font-normal text-ink-soft">{o.hint}</span>}</span>
              {o.value === value && <Icon name="check" size={16} className="text-pine" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
