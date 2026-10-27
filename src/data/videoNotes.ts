// Written notes for Jason's videos (src/data/video-notes/*.json), shown on each /videos/<slug> page:
// key takeaways, the questions the video answers (FAQ schema), and the community guides it covers.
// Written from the video's transcript. YouTube's automatic captions mishear names and numbers, so a figure is
// included only when the video states it clearly, and it's attributed to the video's date (and the source Jason
// names, where he names one). Places are described by homes, market and location only (fair housing).
export interface VideoNote { id: string; takeaways: string[]; faq: { q: string; a: string }[]; places?: string[]; links?: [string, string][] }
const files = import.meta.glob<{ default: VideoNote[] }>('./video-notes/*.json', { eager: true });
export const videoNotes = new Map(Object.values(files).flatMap((f) => f.default).map((n) => [n.id, n]));
