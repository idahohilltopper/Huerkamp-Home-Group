export default function PageHero({ eyebrow, title, children }) {
  return (
    <section className="phero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <p className="sub">{children}</p>}
    </section>
  );
}
