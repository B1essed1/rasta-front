/**
 * Inline SVG icon set — ported verbatim from `design-src/Icons.jsx`.
 *
 * Every icon is a plain function of props, so both call forms work:
 *
 *   {I.check({ width: 16, height: 16 })}     // the form the design markup uses
 *   <I.check width={16} height={16} />       // ordinary JSX component
 *
 * Props are spread onto the <svg> last, so `width`, `height`, `className`,
 * `style`, `aria-hidden`, … all pass through and can override the defaults.
 * Icons draw with `currentColor`, so colour comes from the parent's CSS `color`.
 *
 * The viewBox, path data, stroke widths, linecaps/linejoins and fill rules are
 * byte-identical to the design prototype — do not "tidy" them.
 */

const I = {
  store: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 9.5 5.2 5h13.6L20 9.5M4 9.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5M4 9.5a2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4 0M9.5 20v-5h5v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  grid: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/></svg>,
  spark: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.5 2.5M15.9 15.9l2.5 2.5M18.4 5.6l-2.5 2.5M8.1 15.9l-2.5 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  chat: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3.5V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  globe: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7"/><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.1 0 17M12 3.5c-2.5 2.4-2.5 14.1 0 17" stroke="currentColor" strokeWidth="1.7"/></svg>,
  bolt: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  layers:(p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5ZM3.5 12.5 12 16.8l8.5-4.3M3.5 16.5 12 20.8l8.5-4.3" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  search:(p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8"/><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  tg:    (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M21.9 4.3 2.9 11.6c-1 .4-1 1.8.1 2.1l4.7 1.5 1.8 5.6c.2.7 1.1.9 1.6.3l2.6-2.6 4.7 3.5c.6.5 1.5.1 1.6-.6l2.8-15.6c.2-.9-.7-1.6-1.5-1.5ZM9.4 14.9l9-7.1-7 8-.2 3.4-1.8-4.3Z"/></svg>,
  wa:    (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.5.7.7-2.4-.2-.3a8.2 8.2 0 1 1 6.7 3.4Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.1-.3.1-.5 0a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.5h-.5c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2 1 2.4c.1.2 1.6 2.5 4 3.5 1.4.6 2 .6 2.7.5.4 0 1.4-.5 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.2Z"/></svg>,
  share: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5M6 12v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  plus:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x:     (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>,
  arrow: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  back:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bag:   (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 8h12l-.8 11a1 1 0 0 1-1 .9H7.8a1 1 0 0 1-1-.9L6 8Zm3 0V6.5a3 3 0 0 1 6 0V8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  chart: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  gear:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5m15.5-6.5-1.5 1.5M7.5 16.5 6 18m12 0-1.5-1.5M7.5 7.5 6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  edit:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 20h4L19 9l-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  trash: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye:   (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7"/><circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7"/></svg>,
  dot:   (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="12" cy="12" r="4"/></svg>,
  truck: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 6.5h11v9H3v-9Zm11 3h3.6L21 13v2.5h-7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="7.5" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.6"/><circle cx="16.5" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.6"/></svg>,
  cardp: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5.5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M3 10h18" stroke="currentColor" strokeWidth="1.7"/><path d="M7 14.5h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  home:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 11 12 4l8 7M6 9.5V19a1 1 0 0 0 1 1h3.5v-5h3v5H17a1 1 0 0 0 1-1V9.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  more:  (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>,
  copy:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M5 15V5a1 1 0 0 1 1-1h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  palette:(p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.4 0 2-1 2-1.8 0-.6-.4-1-.4-1.6 0-.7.6-1.2 1.3-1.2H16a4.5 4.5 0 0 0 4.5-4.6C20.5 7 16.7 3.5 12 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="8" cy="11" r="1.1" fill="currentColor"/><circle cx="12" cy="8" r="1.1" fill="currentColor"/><circle cx="16" cy="11" r="1.1" fill="currentColor"/></svg>,
  barcode:(p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 5v14M7 5v14M10.5 5v14M14 5v11M17 5v14M20 5v14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  camera:(p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 8.5h3l1.4-2h7.2L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><circle cx="12" cy="13.5" r="3.2" stroke="currentColor" strokeWidth="1.7"/></svg>,
  scan:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 8V5.5a1.5 1.5 0 0 1 1.5-1.5H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M3.5 12h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  printer:(p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M7 9V4h10v5M7 18H5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M7 14h10v6H7v-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  box:   (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3.5 20 7v10l-8 3.5L4 17V7l8-3.5ZM4 7l8 3.5L20 7M12 10.5v10" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  undo:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 9h9a5 5 0 1 1 0 10H8M4 9l4-4M4 9l4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  down:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  drag:  (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>,
  minus: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>,
  warn:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 4.5 21 19.5H3L12 4.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M12 10v4M12 16.6v.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  phone: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M7.5 3.5h9a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.7"/><path d="M10.5 17.5h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7"/><path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  wallet:(p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M16 12h2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>,
  bell:  (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
};

/** Every icon name in the set, in declaration order. */
export const ICON_NAMES = Object.keys(I);

export { I };
export default I;
