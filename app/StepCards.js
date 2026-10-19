'use client';

import { useState } from 'react';

const steps = [
  {
    title: 'Tell us what you want',
    blurb: 'Pick what matters most: leads, training, culture, split.',
    points: [
      'Fill out the short form at the bottom of this page. It takes about two minutes.',
      'Choose what you are looking for in a team: leads, coaching, culture, support, and more.',
      'Tell us whether you are licensed and how long you have been in real estate.',
    ],
    note: 'Free, confidential, and no obligation.',
  },
  {
    title: 'Get matched',
    blurb: 'We review your goals and tell you honestly if HHG is the right fit.',
    points: [
      'A member of our recruiting team reviews your answers within one business day.',
      'We reach out by phone or text to learn more about your goals.',
      'We tell you honestly whether HHG fits what you want. If it is not a fit, we will say so.',
    ],
    note: 'Expect to hear from us within one business day.',
  },
  {
    title: 'Meet the team',
    blurb: 'Coffee, a team meeting, or a day shadowing. See how we really work.',
    points: [
      'Meet the people you would be working with every day.',
      'Sit in on a team meeting or shadow an agent to see how the day really runs.',
      'Ask anything: coaching, leads, expectations, and what a typical week looks like.',
    ],
    note: 'No pressure. Decide only after you have seen it for yourself.',
  },
  {
    title: 'Onboard & train',
    blurb: 'Get your CRM, scripts, and mentor lined up.',
    points: [
      'Get set up with the team’s systems, scripts, and processes.',
      'Start weekly coaching with national coach Jeff Glover and former MAPS coaches Olivia Manson and Jason Huerkamp.',
      'Meet your Client Care Manager and learn how the team supports your clients.',
    ],
    note: 'You will never be left guessing about what to do next.',
  },
  {
    title: 'Start closing',
    blurb: 'Work leads, build your pipeline, and grow with the group.',
    points: [
      'Start working the buyer and seller leads the team provides.',
      'Lean on a showing partner to get time back while working with buyers.',
      'Focus on the 20% of activities that make you money while the team handles the rest.',
      'Keep growing with weekly coaching, quarterly client events, and a team that celebrates your wins.',
    ],
    note: 'Welcome to the group.',
  },
];

export default function StepCards() {
  const [open, setOpen] = useState(null);
  return (
    <ol className="steps perks">
      {steps.map((s, i) => {
        const on = open === i;
        return (
          <li key={s.title} className={on ? 'open' : ''}>
            <button type="button" className="step-h" aria-expanded={on} aria-controls={'step-' + i}
              onClick={() => setOpen(on ? null : i)}>
              <span className="num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.blurb}</p>
              <span className="more">{on ? 'Show less –' : 'Learn more +'}</span>
            </button>
            <div id={'step-' + i} className="step-body" hidden={!on}>
              <ul>{s.points.map((x) => <li key={x}>{x}</li>)}</ul>
              <p className="note">{s.note}</p>
              <a href="/apply" className="btn small">Get started</a>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
