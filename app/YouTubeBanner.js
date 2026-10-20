const URL = 'https://www.youtube.com/@LivingInMinneapolis';

export default function YouTubeBanner() {
  return (
    <section className="yt">
      <a href={URL} target="_blank" rel="noopener noreferrer" className="yt-inner" aria-label="Watch Living in Minneapolis on YouTube">
        <span className="yt-play" aria-hidden="true">
          <svg viewBox="0 0 68 48" width="88" height="62" role="img" aria-hidden="true">
            <path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.3.3 34 .3 34 .3S12.7.3 7.5 1.7a8.5 8.5 0 0 0-6 6C0 12.9 0 24 0 24s0 11.1 1.5 16.3a8.5 8.5 0 0 0 6 6C12.7 47.7 34 47.7 34 47.7s21.3 0 26.5-1.4a8.5 8.5 0 0 0 6-6C68 35.1 68 24 68 24s0-11.1-1.5-16.3z" fill="#fff" />
            <path d="M27 34V14l18 10z" fill="#d40000" />
          </svg>
        </span>
        <span className="yt-text">
          <span className="yt-eyebrow">Watch us on YouTube</span>
          <strong>Living in Minneapolis</strong>
          <span className="yt-sub">Our YouTube channel, a real estate resource for the Twin Cities from Jason and Brooke Huerkamp. See the brand you would be joining.</span>
        </span>
        <span className="yt-btn">Watch on YouTube ↗</span>
      </a>
    </section>
  );
}
