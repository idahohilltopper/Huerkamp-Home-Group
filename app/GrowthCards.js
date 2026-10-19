'use client';

import { useState } from 'react';

const items = [
  {
    title: 'Targeted lists and ads',
    blurb: 'We use Owldoor to identify high-potential homeowners and run targeted ads that put HHG in front of the right people in our market.',
    points: [
      'Owldoor helps us identify high-potential homeowners',
      'Targeted ads put HHG in front of the right people in our market',
      'More of the right conversations, with less guesswork',
    ],
  },
  {
    title: 'Consistent cold calling',
    blurb: 'We are consistently cold calling to start conversations, create opportunities, and keep our pipeline full.',
    points: [
      'Consistent outreach to start new conversations',
      'Every call creates an opportunity to build the pipeline',
      'A full pipeline is what keeps the team growing',
    ],
  },
  {
    title: 'Monthly and bi-weekly HHG emails',
    blurb: 'Consistent email campaigns from HHG nurture relationships, share our expertise, and keep our team top of mind.',
    points: [
      'Regular email campaigns sent on the HHG brand',
      'Nurture past clients and new contacts alike',
      'Share market insights and opportunities',
      'Keep the team top of mind',
    ],
  },
  {
    title: 'Agent recruiting bonus',
    blurb: 'We have an agent recruiting bonus and actively pitch it to our agents to encourage referrals and introductions.',
    points: [
      'A recruiting bonus for agents who bring great people to the team',
      'Highlighted regularly and actively pitched to the team',
      'Built to encourage referrals and introductions',
    ],
  },
  {
    title: 'Social media, every week',
    blurb: 'Our marketing team creates and publishes multiple social media posts each week across all platforms.',
    points: [
      'Multiple posts every week, across all platforms',
      'Increases visibility for the team and for you',
      'Showcases listings and strengthens the HHG brand',
    ],
  },
  {
    title: 'Targeted recruiting with Ylopo',
    blurb: 'We use Ylopo to run targeted recruiting ads that connect with high-producing agents who may be a fit for HHG.',
    points: [
      'Targeted recruiting ads, powered by Ylopo',
      'Built to reach high-producing agents who may be a fit',
      'A steady stream of talented people joining the conversation',
    ],
  },
  {
    title: 'Dedicated recruiting websites',
    blurb: 'We leverage Jason Huerkamp’s dedicated recruiting websites to attract top talent and make it easy to learn about joining HHG.',
    points: [
      'Dedicated recruiting websites led by Jason Huerkamp',
      'Attract top talent and showcase our opportunity',
      'Make it easy for agents to learn more about joining HHG',
    ],
  },
];

export default function GrowthCards() {
  const [open, setOpen] = useState(null);
  return (
    <div className="grid perks growth">
      {items.map((p, i) => {
        const on = open === i;
        return (
          <div className={'card perk' + (on ? ' open' : '')} key={p.title}>
            <button type="button" className="perk-h" aria-expanded={on} aria-controls={'growth-' + i}
              onClick={() => setOpen(on ? null : i)}>
              <span className="gnum" aria-hidden="true">{i + 1}</span>
              <span className="gtext">
                <h3>{p.title}</h3>
                <p>{p.blurb}</p>
              </span>
              <span className="plus" aria-hidden="true">{on ? '–' : '+'}</span>
            </button>
            <div id={'growth-' + i} className="perk-body" hidden={!on}>
              <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
              <a href="/apply" className="btn small">Join the team</a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
