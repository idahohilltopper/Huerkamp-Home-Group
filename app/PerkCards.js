'use client';

import { useState } from 'react';

const perks = [
  {
    title: 'Focus on the 20% that pays',
    blurb: 'Organized processes, systems, scripts, and manpower so you spend your time on the activities that make money, not the 80% that doesn’t.',
    points: [
      'Organized processes and systems already in place',
      'Scripts and experience from a team that has served the Twin Cities since 2002',
      'Team members who handle the day-to-day so you can sell',
      'Office space, copier and supplies, DocuSign, and business cards covered',
      'The reputation of a demonstrably successful team behind your name',
    ],
    note: 'By being a team member, you earn more and have more freedom than you could on your own.',
  },
  {
    title: 'Weekly coaching',
    blurb: 'Coaching every week from national coach Jeff Glover and former MAPS coaches Olivia Manson and Jason Huerkamp.',
    points: [
      'Coaching every single week, 52 times a year, from national coach Jeff Glover and former MAPS coaches Olivia Manson and Jason Huerkamp',
      'Accountability on your goals and your pipeline',
      'Practical help on what to do next, not just theory',
    ],
    note: 'Valued at $12,000 a year, and included.',
  },
  {
    title: 'Client Care Manager',
    blurb: 'A dedicated manager handles client care and keeps your deals moving.',
    points: [
      'A dedicated Client Care Manager supports your clients',
      'Your clients stay taken care of while you stay focused on new business',
      'A consistent, professional experience for every client',
    ],
    note: 'Valued at $36,000 a year, and included.',
  },
  {
    title: 'Showing Partner',
    blurb: 'A showing partner helps you get time back while working with buyers.',
    points: [
      'A showing partner supports you with buyer showings',
      'Get hours back every week that would otherwise go to driving and unlocking doors',
      'Use that time for listings, new leads, and following up with your clients',
      'Buyers still get a prompt, professional experience',
    ],
    note: 'More time for the work that grows your business.',
  },
  {
    title: 'Leads, provided',
    blurb: 'We are the #1 purchaser of realtor.com leads in the Twin Cities and a Zillow Preferred team, so you spend your time working leads, not buying them.',
    points: [
      'Buyer and seller leads provided to the team',
      '#1 purchaser of realtor.com leads in the Twin Cities',
      'Zillow Preferred team',
      'No lead costs coming out of your pocket',
    ],
    note: 'Valued at $5,000 a month, and included.',
  },
  {
    title: 'Marketing handled',
    blurb: 'Marketing assistance, signs, cards, and quarterly client events. No marketing expenses.',
    points: [
      'Marketing assistance on your listings and your brand',
      'Commissions Inc website included',
      'Open house signs and business cards',
      'Quarterly client events to keep your database warm',
      'No marketing expenses for you',
    ],
    note: 'Your marketing is covered, so every dollar of commission is yours to keep working with.',
  },
  {
    title: 'Cover while you’re away',
    blurb: 'We care for your business while you are on vacation.',
    points: [
      'Your clients and deals are looked after while you are out',
      'Take real time off without your business stalling',
      'A team that has your back',
    ],
    note: 'Valued at $2,500, and included.',
  },
];

export default function PerkCards() {
  const [open, setOpen] = useState(null);
  return (
    <div className="grid perks">
      {perks.map((p, i) => {
        const on = open === i;
        return (
          <div className={'card perk' + (on ? ' open' : '')} key={p.title}>
            <button type="button" className="perk-h" aria-expanded={on} aria-controls={'perk-' + i}
              onClick={() => setOpen(on ? null : i)}>
              <span>
                <h3>{p.title}</h3>
                <p>{p.blurb}</p>
              </span>
              <span className="plus" aria-hidden="true">{on ? '–' : '+'}</span>
            </button>
            <div id={'perk-' + i} className="perk-body" hidden={!on}>
              <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
              <p className="note">{p.note}</p>
              <a href="/apply" className="btn small">Join the team</a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
