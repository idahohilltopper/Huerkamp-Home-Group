'use client';
import { useState, useEffect } from 'react';

const TONES = ['#2b2d31', '#3d3f42', '#4a2a2a', '#2a3a4a', '#33402f', '#41352a', '#2f2f3f', '#3a2f35'];

// Placeholder tiles stand in for MLS photos. Pass real image URLs as `photos` when a feed is connected.
export default function Gallery({ count = 8, status, photos }) {
  const [open, setOpen] = useState(null);
  const items = Array.from({ length: count }, (_, i) => ({ i, src: photos?.[i] }));
  useEffect(() => {
    if (open === null) return;
    const k = (e) => { if (e.key === 'Escape') setOpen(null); if (e.key === 'ArrowRight') setOpen((o) => (o + 1) % count); if (e.key === 'ArrowLeft') setOpen((o) => (o - 1 + count) % count); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, count]);
  const tile = (it, cls) => (
    <button type="button" key={it.i} className={'lst-ph ' + cls} style={{ background: it.src ? `center/cover url(${it.src})` : TONES[it.i % TONES.length] }} onClick={() => setOpen(it.i)} aria-label={`Open photo ${it.i + 1} of ${count}`}>
      {!it.src && <span>Sample photo {it.i + 1}</span>}
    </button>
  );
  return (
    <>
      <div className="lst-gallery">
        {tile(items[0], 'main')}
        {items.slice(1, 5).map((it) => tile(it, ''))}
        <span className="lst-badge"><i aria-hidden="true" />{status}</span>
        <button type="button" className="lst-all" onClick={() => setOpen(0)}>See all {count} photos</button>
      </div>
      {open !== null && (
        <div className="lst-lb" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={() => setOpen(null)}>
          <button type="button" className="lst-x" onClick={() => setOpen(null)} aria-label="Close">×</button>
          <button type="button" className="lst-nav l" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + count) % count); }} aria-label="Previous photo">‹</button>
          <div className="lst-big" style={{ background: items[open].src ? `center/contain no-repeat url(${items[open].src})` : TONES[open % TONES.length] }} onClick={(e) => e.stopPropagation()}>
            {!items[open].src && <span>Sample photo {open + 1}</span>}
          </div>
          <button type="button" className="lst-nav r" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % count); }} aria-label="Next photo">›</button>
          <p className="lst-cnt">{open + 1} / {count}</p>
        </div>
      )}
    </>
  );
}
