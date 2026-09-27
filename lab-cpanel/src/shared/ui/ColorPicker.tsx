import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, Copy, Pipette } from 'lucide-react';
import { clamp, hexToHsv, hsvToHex, hsvToRgb, normalizeHex, rgbToHsv } from '../lib/file/colorUtils';

type HSV = { h: number; s: number; v: number };

const DEFAULT_PRESETS = [
  '#1e88f5', '#7b61f5', '#163a70', '#0b7a68',
  '#a25f00', '#c0392b', '#1b2a44', '#6f7b91',
  '#edf2fa', '#ffffff',
];

export interface ColorPickerProps {
  /** Controlled hex value, e.g. "#1e88f5". */
  value?: string;
  /** Initial value when uncontrolled. */
  defaultValue?: string;
  onChange?: (hex: string) => void;
  /** Swatches shown under the picker. Defaults to the brand palette. */
  presets?: string[];
  label?: string;
  disabled?: boolean;
  /** Render the panel directly in the page instead of behind a swatch/popover. */
  inline?: boolean;
  className?: string;
}

function useDragSurface(ref: React.RefObject<HTMLDivElement | null>, onMove: (x: number, y: number) => void) {
  const dragging = useRef(false);
  const move = useCallback((clientX: number, clientY: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    onMove(clamp((clientX - rect.left) / rect.width, 0, 1), clamp((clientY - rect.top) / rect.height, 0, 1));
  }, [ref, onMove]);

  return {
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      move(e.clientX, e.clientY);
    },
    onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => { if (dragging.current) move(e.clientX, e.clientY); },
    onPointerUp: () => { dragging.current = false; },
  };
}

/**
 * A self-contained HSV color picker: drag square for saturation/brightness,
 * hue slider, hex + RGB inputs, presets, and a small "recently used" row.
 * Use `inline` to embed the panel directly (e.g. inside a settings form), or
 * leave it as a swatch button that opens a popover on click.
 */
export default function ColorPicker({
  value,
  defaultValue = '#1e88f5',
  onChange,
  presets = DEFAULT_PRESETS,
  label = 'Color',
  disabled = false,
  inline = false,
  className = '',
}: ColorPickerProps) {
  const initialValue = normalizeHex(value ?? defaultValue) ?? '#1e88f5';
  const [hsv, setHsvState] = useState<HSV>(() => hexToHsv(initialValue) ?? { h: 210, s: 87, v: 96 });
  const [open, setOpen] = useState(inline);
  const [hexDraft, setHexDraft] = useState(() => initialValue.toUpperCase());
  const [recent, setRecent] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const hex = useMemo(() => hsvToHex(hsv), [hsv]);
  const rgb = useMemo(() => hsvToRgb(hsv), [hsv]);
//   const controlledHex = value !== undefined ? normalizeHex(value) : null;
//   const activeHex = controlledHex ?? hex;
//   const activeHsv = controlledHex ? (hexToHsv(controlledHex) ?? hsv) : hsv;
//   const activeRgb = useMemo(() => hsvToRgb(activeHsv), [activeHsv]);
//   const hexInputValue = value !== undefined ? activeHex.toUpperCase() : hexDraft.toUpperCase();

  const commit = (next: HSV) => {
    setHsvState(next);
    const nextHex = hsvToHex(next);
    setHexDraft(nextHex.toUpperCase());
    onChange?.(nextHex);
  };

  const closePanel = useCallback(() => {
    setOpen(false);
    const currentHex = value ?? hex;
    setRecent(curr => (curr[0] === currentHex ? curr : [currentHex, ...curr.filter(c => c !== currentHex)].slice(0, 8)));
  }, [hex, value]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open || inline) return;
    const onDown = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) closePanel();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [closePanel, inline, open]);

  const svDrag = useDragSurface(svRef, (x, y) => commit({ ...hsv, s: x * 100, v: (1 - y) * 100 }));
  const hueDrag = useDragSurface(hueRef, x => commit({ ...hsv, h: x * 360 }));

  const nudge = (key: 'h' | 's' | 'v', delta: number, max: number) =>
    commit({ ...hsv, [key]: clamp(hsv[key] + delta, 0, max) });

  const onSvKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowRight') nudge('s', step, 100);
    else if (e.key === 'ArrowLeft') nudge('s', -step, 100);
    else if (e.key === 'ArrowUp') nudge('v', step, 100);
    else if (e.key === 'ArrowDown') nudge('v', -step, 100);
    else return;
    e.preventDefault();
  };
  const onHueKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 15 : 3;
    if (e.key === 'ArrowRight') nudge('h', step, 360);
    else if (e.key === 'ArrowLeft') nudge('h', -step, 360);
    else return;
    e.preventDefault();
  };

  const applyHexDraft = (raw: string) => {
    setHexDraft(raw);
    const parsed = normalizeHex(raw);
    if (parsed) commit(hexToHsv(parsed)!);
  };

  const applyRgbChannel = (channel: 'r' | 'g' | 'b', raw: string) => {
    const n = clamp(Number(raw) || 0, 0, 255);
    commit(rgbToHsv({ ...rgb, [channel]: n }));
  };

  const copyHex = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* clipboard unavailable — silently ignore */ }
  };

  const panel = (
    <div ref={panelRef} className={inline ? '' : 'absolute z-20 mt-2 w-64 rounded-lg bg-white p-3 shadow-[0_16px_40px_rgba(22,58,112,0.18)]'}>
      <div
        ref={svRef}
        role="slider"
        aria-label="Saturation and brightness"
        aria-valuetext={`Saturation ${Math.round(hsv.s)}%, brightness ${Math.round(hsv.v)}%`}
        tabIndex={0}
        onKeyDown={onSvKeyDown}
        className="relative h-36 w-full touch-none select-none rounded-md"
        style={{ background: `linear-gradient(to top, #000, rgba(0,0,0,0)), linear-gradient(to right, #fff, rgba(255,255,255,0)), hsl(${hsv.h} 100% 50%)` }}
        {...svDrag}
      >
        <div
          className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: hex }}
        />
      </div>

      <div
        ref={hueRef}
        role="slider"
        aria-label="Hue"
        aria-valuenow={Math.round(hsv.h)}
        aria-valuemin={0}
        aria-valuemax={360}
        tabIndex={0}
        onKeyDown={onHueKeyDown}
        className="relative mt-3 h-3 touch-none select-none rounded-full"
        style={{ background: 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)' }}
        {...hueDrag}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: `hsl(${hsv.h} 100% 50%)` }}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-8 flex-1 items-center gap-1.5 rounded-md bg-surface-soft px-2">
          <span className="text-xs font-semibold text-muted">#</span>
          <input
            id={inputId}
            value={hexDraft.replace('#', '')}
            onChange={e => applyHexDraft(e.target.value)}
            spellCheck={false}
            maxLength={6}
            className="w-full bg-transparent font-mono text-xs font-semibold uppercase text-ink outline-none"
            aria-label="Hex color value"
          />
        </div>
        <button type="button" onClick={copyHex} className="grid h-8 w-8 flex-none place-items-center rounded-md bg-surface-soft text-muted hover:bg-surface-sunk" aria-label="Copy hex code">
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {(['r', 'g', 'b'] as const).map(ch => (
          <label key={ch} className="flex items-center gap-1 rounded-md bg-surface-soft px-2 py-1.5">
            <span className="text-[10px] font-bold uppercase text-muted">{ch}</span>
            <input
              type="number" min={0} max={255} value={Math.round(rgb[ch])}
              onChange={e => applyRgbChannel(ch, e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-ink outline-none"
              aria-label={`${ch.toUpperCase()} channel`}
            />
          </label>
        ))}
      </div>

      {presets.length > 0 && (
        <>
          <p className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-wide text-muted">Presets</p>
          <SwatchRow colors={presets} current={hex} onPick={c => commit(hexToHsv(c)!)} />
        </>
      )}
      {recent.length > 0 && (
        <>
          <p className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-wide text-muted">Recently used</p>
          <SwatchRow colors={recent} current={hex} onPick={c => commit(hexToHsv(c)!)} />
        </>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className={className}>
        {label && <p className="mb-1.5 text-xs font-semibold text-muted">{label}</p>}
        {panel}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      {label && <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-muted">{label}</label>}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-md bg-surface-soft px-2.5 py-2 hover:bg-surface-sunk disabled:cursor-not-allowed disabled:opacity-50"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Pipette className="h-3.5 w-3.5 text-muted" aria-hidden />
        <span className="h-6 w-6 flex-none rounded-md ring-1 ring-inset ring-black/10" style={{ backgroundColor: hex }} />
        <span className="font-mono text-xs font-semibold text-ink">{hex.toUpperCase()}</span>
      </button>
      {open && panel}
    </div>
  );
}

function SwatchRow({ colors, current, onPick }: { colors: string[]; current: string; onPick: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {colors.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onPick(c)}
          className="relative h-6 w-6 rounded-md ring-1 ring-inset ring-black/10"
          style={{ backgroundColor: c }}
          aria-label={`Use color ${c}`}
        >
          {c.toLowerCase() === current.toLowerCase() && (
            <Check className="absolute inset-0 m-auto h-3.5 w-3.5" style={{ color: isLight(c) ? '#1b2a44' : '#fff' }} />
          )}
        </button>
      ))}
    </div>
  );
}

function isLight(hex: string): boolean {
  const n = parseInt(normalizeHex(hex)?.slice(1) ?? '000000', 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 170;
}