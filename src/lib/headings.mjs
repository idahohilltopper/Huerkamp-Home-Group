// Markdown plugin: a post's headings start at h2 (the page title is the h1), with no levels skipped.
// Imported posts often began at h3 or used h1; screen readers and Google read heading order as the outline.
export function remarkHeadingFloor() {
  return (tree) => {
    const heads = [];
    const walk = (n) => { if (n.type === 'heading') heads.push(n); (n.children ?? []).forEach(walk); };
    walk(tree);
    if (!heads.length) return;
    // Shift so the top level is h2, then close any gaps (h2 → h4 becomes h2 → h3).
    const shift = 2 - Math.min(...heads.map((h) => h.depth));
    let prev = 1;
    for (const h of heads) {
      const d = Math.min(6, h.depth + shift);
      h.depth = Math.min(d, prev + 1);
      prev = h.depth;
    }
  };
}
