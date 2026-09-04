import React from 'react';

export default function Logo({ size = 32, color = 'currentColor', className = '' }) {
  return (
    <svg
      className={`logo-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="40" height="40" rx="12" fill="var(--primary, #1f7a72)" />
      <path
        d="M10 28V12h6c3.3 0 5 1.8 5 4.2 0 1.8-1 3.2-2.8 3.8l3.8 8h-3.6l-3.2-7.2H13.4V28H10zm3.4-10h2.4c1.4 0 2.2-.8 2.2-2s-.8-2-2.2-2h-2.4v4z"
        fill="#fff"
      />
      <circle cx="28" cy="16" r="3" fill="var(--saffron, #e09a36)" />
    </svg>
  );
}
