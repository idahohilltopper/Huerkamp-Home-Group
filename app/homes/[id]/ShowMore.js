'use client';
import { useState } from 'react';
export default function ShowMore({ text }) {
  const [more, setMore] = useState(false);
  const long = text.length > 280;
  return (
    <div>
      <p className={'lst-desc' + (long && !more ? ' clip' : '')}>{text}</p>
      {long && <button type="button" className="lst-link" onClick={() => setMore(!more)} aria-expanded={more}>{more ? 'Show less' : 'Show more'}</button>}
    </div>
  );
}
