# Hero photo

- File: `minneapolis-skyline-*`
- Title: Downtown Minneapolis skyline across the Mississippi River (August 2026)
- Photographer: Guywelch2000 (Wikimedia Commons)
- License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/
- Source: https://commons.wikimedia.org/wiki/File:Downtown_Minneapolis_skyline_across_the_Mississippi_River.jpg
- Requirement: visible credit to the photographer with a link to the license and source (done in the site footer).
- Changes: power lines removed and resized. The unaltered 3840-pixel rendering from Wikimedia is kept at `photos/minneapolis-skyline-3840-original.jpg`; `scripts/remove-power-lines.py` removes the wires to make `minneapolis-skyline-3840.jpg`, and scripts/make-hero.py makes the site sizes.

# Home page photo (since Nov 12, 2026)

- File: `home-skyline-aerial-*`, used on the home page (src/pages/index.astro); the skyline photo above is still used
  elsewhere (src/components/Skyline.astro).
- What: an aerial from the team's own listing MLS 7109462 (photo 23 of the listing): Minneapolis neighborhoods out to
  the downtown skyline. Jason chose it Nov 12, 2026 from mockups (it replaced the Lakeville twilight photo, MLS 7115021,
  used Nov 11 only).
- Made from the MLS copy (1600 px): enlarged 2x with the EDSR super-resolution model (OpenCV dnn_superres), lightly
  sharpened, the top of the sky trimmed; sizes 640-2560 px.
- To do (Jason): confirm with the listing photographer that the team may use it as the website's main image, and ask
  for the full-size original (replace these files with it).
