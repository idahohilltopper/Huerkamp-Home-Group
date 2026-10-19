import Link from 'next/link';

const perks = [
  '401(k)*',
  '$5,000 recruiting bonus per agent*',
  'Up to $4,000 in bonuses on every buy-side file*',
];

export default function TopPerks() {
  return (
    <div className="topperks">
      <ul>
        {perks.map((p) => <li key={p}>{p}</li>)}
      </ul>
      <p>* <Link href="/terms">Terms and conditions apply.</Link></p>
    </div>
  );
}
