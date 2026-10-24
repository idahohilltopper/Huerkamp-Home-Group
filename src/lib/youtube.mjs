// Fast YouTube embeds: show the video's thumbnail with a play button and load YouTube's
// heavy player (~1 MB) only when someone clicks. Without JavaScript the link opens YouTube.

/** Video ID from a YouTube URL (watch, youtu.be, shorts, embed, live) or a bare ID. */
export function youtubeId(input) {
  const s = String(input).trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** opts.short: vertical YouTube Short. opts.eager: the video is the main thing on the page (load its thumbnail first). */
export function youtubeHtml(id, title = 'Video', opts = {}) {
  const href = opts.short ? `https://www.youtube.com/shorts/${id}` : `https://www.youtube.com/watch?v=${id}`;
  const img = opts.eager
    ? `<img src="https://i.ytimg.com/vi/${id}/hq720.jpg" alt="" width="1280" height="720" fetchpriority="high" decoding="async" />`
    : `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async" />`;
  return `<div class="yt${opts.short ? ' yt--short' : ''}" data-yt="${id}" data-title="${esc(title)}">` +
    `<a class="yt__link" href="${href}" aria-label="Play video: ${esc(title)}">` + img +
    `<span class="yt__play" aria-hidden="true"></span></a></div>`;
}

/** Markdown plugin: a YouTube link alone on its own line becomes a video player. */
export function remarkYoutube() {
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.map((child) => {
      if (child.type === 'paragraph' && child.children.length === 1) {
        const only = child.children[0];
        const url = only.type === 'link' ? only.url : only.type === 'text' ? only.value : '';
        const id = url && /youtu/.test(url) ? youtubeId(url) : null;
        if (id) {
          const label = only.type === 'link' && only.children?.[0]?.value !== url ? only.children?.[0]?.value : undefined;
          return { type: 'html', value: youtubeHtml(id, label || 'Video') };
        }
      }
      walk(child);
      return child;
    });
  };
  return walk;
}
