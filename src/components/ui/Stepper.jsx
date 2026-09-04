import React from 'react';

export default function Stepper({ steps, current, onStepClick }) {
  return (
    <div className="stepper">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`stepper__step ${i === current ? 'stepper__step--active' : ''} ${
            i < current ? 'stepper__step--done' : ''
          }`}
          onClick={() => onStepClick && i < current && onStepClick(i)}
        >
          <div className="stepper__circle">
            {i < current ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          <span className="stepper__label">{step}</span>
          {i < steps.length - 1 && <div className="stepper__line" />}
        </div>
      ))}
    </div>
  );
}
