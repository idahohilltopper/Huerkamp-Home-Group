// Page-hero photos (Jason, Nov 26, 2026: design review: "the same downtown Minneapolis photo on almost every page").
// City pages (/communities/<city> and /homes-for-sale/<city>/...) show a photo of that city when one is listed here;
// Team and Sell show the team photo once public/hero/team-1920.jpg exists. Everything else keeps the skyline
// (src/components/Skyline.astro). Every photo is free to reuse with credit: the credit shows on the photo itself and in
// public/hero/CREDITS.md. Files are made with scripts/make-place-hero.py.
import { existsSync } from 'node:fs';

export interface HeroPhoto {
  /** File name start in public/hero/: <name>-<width>.webp and <name>-1920.jpg */
  name: string;
  widths: number[];
  width: number;
  height: number;
  alt: string;
  /** CSS object-position when the default (50% 40%) would crop out the subject. */
  position?: string;
  /** 'light': a lighter shade behind the words, for bright photos that the default shade makes look hazy. */
  shade?: 'light';
  credit?: { author: string; license: string; licenseUrl: string; source: string };
}

const BY = (v: string) => `https://creativecommons.org/licenses/by/${v}/`;
const BYSA = (v: string) => `https://creativecommons.org/licenses/by-sa/${v}/`;
void BY;

/** City slug -> photo. Filled in as photos are chosen. */
export const cityPhotos: Record<string, HeroPhoto> = {
  lakeville: {
    name: 'lakeville', widths: [640, 960, 1280, 1920], width: 1920, height: 1280, alt: 'Lakeville City Hall on a summer day',
    credit: { author: 'Allmightyduck', license: 'CC BY-SA 3.0', licenseUrl: BYSA('3.0'), source: 'https://commons.wikimedia.org/wiki/File:Lakeville-City-Hall.jpg' },
  },
};

/** The team photo for Team and Sell (Jason, Nov 27, 2026: the team on a lakeside lawn). */
export const teamPhoto: HeroPhoto | undefined = existsSync('public/hero/team-1920.jpg')
  ? { name: 'team', widths: [640, 960, 1280, 1920], width: 1920, height: 1083, alt: 'The Huerkamp Home Group team together on a lakeside lawn', position: '50% 78%', shade: 'light' }
  : undefined;
