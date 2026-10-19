const stats = [
  ['#1', 'Keller Williams team in the North Central region'],
  ['$190M', 'in volume every year'],
  ['520', 'units every year'],
  ['#1', 'realtor.com lead purchaser in the Twin Cities'],
];

export default function Stats() {
  return (
    <section className="stats" aria-label="HHG by the numbers">
      {stats.map(([n, l]) => (
        <div key={l}><strong>{n}</strong><span>{l}</span></div>
      ))}
    </section>
  );
}
