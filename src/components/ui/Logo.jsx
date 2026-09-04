export default function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className="mark" aria-hidden="true">
      <rect x="5" y="5" width="150" height="150" rx="36" fill="none" stroke="#E4573B" strokeWidth="12"/>
      <path d="M53 117 V69 A24 24 0 0 1 101 69" fill="none" stroke="#E4573B" strokeWidth="12" strokeLinecap="round"/>
      <circle cx="107" cy="111" r="11" fill="#E4573B"/>
    </svg>
  );
}
