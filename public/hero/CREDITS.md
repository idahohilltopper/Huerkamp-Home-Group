# Hero photo

- File: `minneapolis-skyline-*`
- Title: Downtown Minneapolis skyline across the Mississippi River (August 2026)
- Photographer: Guywelch2000 (Wikimedia Commons)
- License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/
- Source: https://commons.wikimedia.org/wiki/File:Downtown_Minneapolis_skyline_across_the_Mississippi_River.jpg
- Requirement: visible credit to the photographer with a link to the license and source (done in the site footer).
- Changes: power lines removed and resized. The unaltered 3840-pixel rendering from Wikimedia is kept at `photos/minneapolis-skyline-3840-original.jpg`; `scripts/remove-power-lines.py` removes the wires to make `minneapolis-skyline-3840.jpg`, and scripts/make-hero.py makes the site sizes.

# Home page photo (since Nov 11, 2026)

- File: `home-twilight-*`, used on the home page (src/pages/index.astro); the skyline above is still used elsewhere
  (src/components/Skyline.astro).
- What: the team's own listing at 18004 Jacquard Path, Lakeville (MLS 7115021), at twilight, from the listing's MLS
  photos (1600 px, the largest the MLS keeps). Jason chose it Nov 11, 2026 from a set of mockups.
- To do (Jason): confirm with the listing photographer that the team may use it as the website's main image, ask for
  the full-size original (replace these files with it), and ask the sellers once it has closed.
- Nov 11, 2026: enlarged 2x (3200 px) with the EDSR super-resolution model (OpenCV dnn_superres), lightly sharpened, and the
  house number blurred; sizes 640-2560 px. Replace with the photographer's full-size original when Jason has it.
