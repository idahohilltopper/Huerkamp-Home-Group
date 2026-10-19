'use client';

import { useState } from 'react';

const icons = {
  laptop: <><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M2 20h20" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
  tablet: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></>,
  gift: <><rect x="3" y="8" width="18" height="4" /><path d="M12 8v13M19 12v9H5v-9M7.5 8a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 1 1 0 5" /></>,
  smartphone: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M12 18h.01" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9.5 16l2 2 3.5-4" /></>,
};

const items = [
  {
    icon: 'laptop',
    title: 'Fello targeting lists and ads',
    blurb: 'We use Fello to identify high-potential homeowners and run targeted ads that put HHG in front of the right people in our market.',
    points: [
      'Fello helps us identify high-potential homeowners',
      'Targeted ads put HHG in front of the right people in our market',
      'More of the right conversations, with less guesswork',
    ],
    link: ['Visit Fello', 'https://fello.ai'],
  },
  {
    icon: 'phone',
    title: 'Consistent cold calling',
    blurb: 'We are consistently cold calling to start conversations, create opportunities, and keep our pipeline full.',
    points: [
      'Consistent outreach to start new conversations',
      'Every call creates an opportunity to build the pipeline',
      'A full pipeline is what keeps the team growing',
    ],
  },
  {
    icon: 'tablet',
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
    icon: 'gift',
    title: 'Agent recruiting bonus',
    blurb: 'Earn a $5,000 bonus when you close two team leads in your first 120 days. It applies when you join the team yourself, too.',
    points: [
      '$5,000 bonus for closing two team leads in your first 120 days',
      'Applies to people you bring onto the team',
      'Also applies to bringing yourself onto the team',
    ],
  },
  {
    icon: 'smartphone',
    title: 'Social media, every week',
    blurb: 'Our marketing team creates and publishes multiple social media posts each week across all platforms.',
    points: [
      'Multiple posts every week, across all platforms',
      'Increases visibility for the team and for you',
      'Showcases listings and strengthens the HHG brand',
    ],
  },
  {
    icon: 'laptop',
    title: 'Ylopo targeted recruiting',
    blurb: 'We use Ylopo to run targeted recruiting ads that connect with high-producing agents who may be a fit for HHG.',
    points: [
      'Targeted recruiting ads, powered by Ylopo',
      'Built to reach high-producing agents who may be a fit',
      'A steady stream of talented people joining the conversation',
    ],
    link: ['Visit Ylopo', 'https://www.ylopo.com'],
  },
  {
    icon: 'globe',
    title: 'JoinHHG.com',
    blurb: 'We leverage our dedicated recruiting website, JoinHHG.com, to attract top talent, showcase our opportunity, and make it easy for agents to learn more about joining HHG.',
    points: [
      'A dedicated recruiting website, built for agents',
      'Attracts top talent and showcases our opportunity',
      'Makes it easy to learn more about joining HHG',
    ],
    link: ['Visit JoinHHG.com', 'https://joinhhg.com'],
  },
  {
    icon: 'laptop',
    title: 'A CINC website for every agent',
    blurb: 'All of our agents get a CINC (Commissions Inc) website as part of what they do, and work the lead information it captures.',
    points: [
      'Every agent gets their own CINC (Commissions Inc) website',
      'Lead information from the CINC website goes to work for you',
      'Built into the team’s systems, so you do not have to set it up on your own',
    ],
    link: ['Visit CINC', 'https://www.cincpro.com'],
  },
  {
    icon: 'calendar',
    title: 'Weekly accountability meeting (WAM)',
    blurb: 'Every week the team holds WAM, the weekly accountability meeting from the book The 12 Week Year, to keep everyone on plan.',
    points: [
      'WAM is the weekly accountability meeting, a core practice of The 12 Week Year',
      'Review last week’s results against your plan',
      'Commit to the specific actions for the week ahead',
      'Pairs with weekly coaching, so goals turn into daily habits',
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
              <span className="gicon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[p.icon]}</svg>
              </span>
              <span className="gtext">
                <h3>{p.title}</h3>
                <p>{p.blurb}</p>
              </span>
              <span className="plus" aria-hidden="true">{on ? '–' : '+'}</span>
            </button>
            <div id={'growth-' + i} className="perk-body" hidden={!on}>
              <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
              {p.link && <a href={p.link[1]} target="_blank" rel="noopener noreferrer" className="btn small ghost-dark">{p.link[0]} ↗</a>}
              <a href="/apply" className="btn small">Join the team</a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
