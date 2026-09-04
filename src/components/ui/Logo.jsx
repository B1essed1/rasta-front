export default function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className="mark" aria-hidden="true">
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="var(--primary, #1f7a72)"/>
      <path d="M7 22v-6a3 3 0 0 1 6 0v6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/>
      <path d="M13 22v-6a3 3 0 0 1 6 0v6" stroke="var(--saffron, #e09a36)" strokeWidth="2.1" strokeLinecap="round"/>
      <path d="M19 22v-6a3 3 0 0 1 6 0v6" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/>
      <path d="M6 22h20" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"/>
    </svg>
  );
}
