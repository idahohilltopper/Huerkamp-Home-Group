export default function VideoSection() {
  return (
    <section className="video-section" id="video">
      <p className="eyebrow dark">Watch</p>
      <h2>See what it&apos;s like to join Huerkamp Home Group</h2>
      <div className="video-frame">
        <iframe
          src="https://player.vimeo.com/video/1223807819?h=08c015b9bb&title=0&byline=0&portrait=0&dnt=1"
          title="Huerkamp Home Group recruiting video"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <p className="video-alt">Video not loading? <a href="https://vimeo.com/1223807819/08c015b9bb" target="_blank" rel="noopener noreferrer">Watch it on Vimeo ↗</a></p>
    </section>
  );
}
