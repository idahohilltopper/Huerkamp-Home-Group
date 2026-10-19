'use client';

import { useEffect, useState } from 'react';

// Lights up one item at a time with a double flash, then moves on to the next.
export default function FlashList({ items, className, prefix = '' }) {
  const [active, setActive] = useState(-1);
  useEffect(() => {
    let i = 0;
    const tick = () => { setActive(i % items.length); i += 1; };
    const first = setTimeout(tick, 600);
    const id = setInterval(tick, 1100);
    return () => { clearTimeout(first); clearInterval(id); };
  }, [items.length]);
  return (
    <ul className={className + ' flash-list'}>
      {items.map((t, i) => (
        <li key={t + (i === active ? '-on' : '')} className={i === active ? 'flash' : ''}>{prefix}{t}</li>
      ))}
    </ul>
  );
}
