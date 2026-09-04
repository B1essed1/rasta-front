import React from 'react';

const statusColors = {
  new: { bg: '#e8f5e9', color: '#2e7d32' },
  open: { bg: '#e3f2fd', color: '#1565c0' },
  confirmed: { bg: '#fff3e0', color: '#e65100' },
  delivered: { bg: '#e8f5e9', color: '#1b5e20' },
  cancelled: { bg: '#ffebee', color: '#c62828' },
  published: { bg: '#e8f5e9', color: '#2e7d32' },
  hidden: { bg: '#f5f5f5', color: '#757575' },
  low: { bg: '#fff3e0', color: '#e65100' },
  out: { bg: '#ffebee', color: '#c62828' },
};

export default function StatusPill({ status, label }) {
  const s = statusColors[status] || { bg: '#f5f5f5', color: '#333' };
  return (
    <span
      className="status-pill"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {label || status}
    </span>
  );
}
