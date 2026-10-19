import Link from 'next/link';

export default function AgentPlusBand({ compact = false }) {
  return (
    <section className="ap-band">
      <div className="ap-inner">
        <p className="eyebrow">Agent+ with Mutual of Omaha Mortgage</p>
        <h2>Two more ways HHG puts money in your pocket</h2>
        <div className="ap-grid">
          <div className="ap-card">
            <strong>Up to $4,000</strong>
            <span className="ap-label">per buy-side file</span>
            <p>Earn half a point, 50 basis points (0.50%), of the loan amount on every buy-side file, on loans up to $800,000, above and beyond your real estate commission.</p>
          </div>
          <div className="ap-card">
            <strong>Matching 401(k)</strong>
            <span className="ap-label">employer match</span>
            <p>Build real wealth with a 401(k) that includes an employer match.</p>
          </div>
        </div>
        {!compact && <Link href="/agent-plus" className="btn ap-btn">See how Agent+ works</Link>}
        <p className="ap-fine">Through the Agent+ dual licensing program from Mutual of Omaha Mortgage. Participation requires mortgage licensing and is subject to program terms. &ldquo;Up to $4,000&rdquo; is the maximum, based on 0.50% of an $800,000 loan, and is not a guarantee.</p>
      </div>
    </section>
  );
}
