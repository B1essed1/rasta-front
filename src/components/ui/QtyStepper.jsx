import React from 'react';
import { I } from './Icons';

// The design's quantity control (design-src/UI.jsx → Stepper).
// Named QtyStepper here because components/ui/Stepper.jsx is the onboarding
// progress bar. Markup + `.stepper` class structure are the design's.
export default function QtyStepper({ value, min, max, onChange }) {
  const lo = min != null ? min : 0;
  const hi = max != null ? max : Infinity;
  const clamp = (n) => Math.max(lo, Math.min(hi, n));
  const v = value != null ? value : lo;
  return (
    <div className="stepper" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => onChange(clamp(v - 1))} aria-label="minus">{I.minus({ width: 15, height: 15 })}</button>
      <input
        value={v}
        onChange={(e) => onChange(clamp(Number(e.target.value.replace(/\D/g, '')) || 0))}
        inputMode="numeric"
      />
      <button onClick={() => onChange(clamp(v + 1))} aria-label="plus">{I.plus({ width: 15, height: 15 })}</button>
    </div>
  );
}
