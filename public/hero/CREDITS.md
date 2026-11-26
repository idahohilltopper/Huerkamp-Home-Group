# Hero photo

- File: `minneapolis-skyline-*`
- Title: Downtown Minneapolis skyline across the Mississippi River (August 2026)
- Photographer: Guywelch2000 (Wikimedia Commons)
- License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/
- Source: https://commons.wikimedia.org/wiki/File:Downtown_Minneapolis_skyline_across_the_Mississippi_River.jpg
- Requirement: visible credit to the photographer with a link to the license and source (done in the site footer).
- Changes: power lines removed and resized. The unaltered 3840-pixel rendering from Wikimedia is kept at `photos/minneapolis-skyline-3840-original.jpg`; `scripts/remove-power-lines.py` removes the wires to make `minneapolis-skyline-3840.jpg`, and scripts/make-hero.py makes the site sizes.

# Home page photo (since Nov 14, 2026)

- File: `home-sunset-*`, used on the home page (src/pages/index.astro); the skyline photo above is still used
  elsewhere (src/components/Skyline.astro).
- Title: Minneapolis Sunset (view of downtown Minneapolis during sunset from Tower Hill Park, June 1, 2018)
- Photographer: BpA9543 (Wikimedia Commons)
- License: CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/
- Source: https://commons.wikimedia.org/wiki/File:Minneapolis_Sunset.jpg
- Requirement: visible credit with links to the license and source (done in the site footer). Changes: resized only.
- Jason chose it Nov 14, 2026 from three mockups ("go with 1"). It replaced the aerial from the team's listing
  MLS 7109462 (Nov 12-14), which was a 1600-pixel MLS photo and looked soft full-width.

# City photos (since Nov 26, 2026)

City pages show a photo of that city (src/data/hero-photos.ts); each is credited on the photo itself. Made with
scripts/make-place-hero.py (cropped to 3:2 and resized only).

- `lakeville-*`: Lakeville City Hall. Allmightyduck, CC BY-SA 3.0, https://creativecommons.org/licenses/by-sa/3.0/,
  source https://commons.wikimedia.org/wiki/File:Lakeville-City-Hall.jpg
- Picked but not yet downloaded (Wikimedia rate-limited this server, Nov 26): Bloomington File:Normandale_Lake.jpg
  (Tyler Vigen, CC BY 4.0); Woodbury File:Powers_Lake_Woodbury_MN.jpg (EricWoodbury8301, CC BY 4.0); Prior Lake
  File:Priorlakebridge.jpg (Jeanqueq, CC BY-SA 4.0); Eden Prairie File:Purgatory_Creek_Park,_Eden_Prairie,_MN_Aug_2023_01.jpg
  (Thomson200, CC0); Savage File:Credit_River_Savage.jpg (Tim Kiser, CC BY-SA 2.5); Farmington
  File:The_Rambling_River_-_panoramio.jpg (Jayesh Naithani, CC BY-SA 3.0); Inver Grove Heights
  File:Mississippi_River_Greenway_-_Inver_Grove_Heights_-_Minnesota.jpg (Tony Webster, CC BY-SA 2.0). Each must be
  looked at before use. No usable free photo found yet: Burnsville, Shakopee, Apple Valley, Eagan, Rosemount, Saint Paul.
