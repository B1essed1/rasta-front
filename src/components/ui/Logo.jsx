// Geometry copied verbatim from the design's Logo (design-src/Icons.jsx).
// Stroke colour follows --primary rather than being hardcoded, so the mark
// re-tints with the palette instead of pinning one accent.
export default function Logo({ size = 26, color = 'var(--primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className="mark" aria-hidden="true">
      <rect x="6" y="6" width="148" height="148" rx="36" stroke={color} strokeWidth="13"/>
      <path d="M53 117 V69 A24 24 0 0 1 101 69" stroke={color} strokeWidth="13" strokeLinecap="round"/>
      <circle cx="107" cy="111" r="11.5" fill={color}/>
    </svg>
  );
}
