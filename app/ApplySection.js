import ApplyForm from './ApplyForm';

export default function ApplySection() {
  return (
    <section className="final" id="apply">
      <h2>Ready for new opportunities?</h2>
      <p className="sub">Tell us what you&apos;re looking for. We&apos;ll take it from there.</p>
      <div className="formwrap"><ApplyForm /></div>
    </section>
  );
}
