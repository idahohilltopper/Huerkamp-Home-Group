# Huerkamp Home Group website: working rules

Astro site on Netlify. **Every push to `claude/real-estate-website-build-9itecr` goes live within minutes**, so a
broken change reaches buyers right away. Jason (the owner) is not a developer: explain things in plain English.

## Before and after every push (required)

1. **Before pushing:** `bash scripts/site-check/preflight.sh`. It builds the site with made-up sample homes, runs the
   launch checks, serves the build locally (`/api/*` goes to the live site) and runs the full site check on it.
   Push only when it prints `PREFLIGHT PASSED`. Add `BROWSERS="chromium webkit firefox"` when the change touches
   page scripts or styles and those browsers are installed (GitHub Actions has them; this container has only Chromium).
2. **Push:** `git fetch -q origin <branch> && git merge -q --no-edit origin/<branch>` first (scheduled routines push too).
3. **After pushing:** `bash scripts/site-check/after-deploy.sh` waits for Netlify's deploy and runs the site check on
   the live site. **If it fails, revert at once** (`git revert --no-edit HEAD && git push`), then fix and try again.
4. Small text-only changes (docs, data JSON) can skip step 1, never step 3.
5. **Every push is a Netlify production deploy and counts against the Netlify plan's monthly usage.** On Nov 9, 2026
   the account ran out and Netlify paused the whole site (every page answered 503 "usage_exceeded"). Batch changes into
   as few pushes as possible. A push that changes only `docs/`, `CLAUDE.md` or the Repliers email templates (`email-templates/`) is not built (netlify.toml `ignore`). The site also rebuilds itself 4 times a day
   (`netlify/functions/rebuild.mjs`).

## Checks that run on their own

- GitHub Actions (`.github/workflows/`): **Site check** in Chrome, Safari (WebKit) and Firefox, desktop and phone,
  every morning and after every push; **Weekly crawl** of every button and link on the main pages; **Services check**
  every hour (maps, MLS feed, sold homes, Google suggestions, lead endpoint, visitor-error jumps). Failed runs email
  the repository owner.
- Visitor errors: browsers report errors to `/api/client-error` (GET = last 7 days, `?hours=1` = last hour).
- `/mls-status.json`: what the last build's MLS and lake-sales downloads did.
- Add a step to `scripts/site-check/smoke.cjs` for every new feature a buyer clicks (forms, maps, buttons).

## Standing rules

- Never put API keys or secrets in chat or in the repo. They live only in Netlify environment variables.
- Reviews verbatim only. Never invent statistics; every figure names its source.
- Fair housing: no school rankings, demographics or "best for families"; never describe a neighborhood by who lives
  there; avoid "safe" and "family-friendly"; no income, education, age, ancestry or household make-up.
- NorthstarMLS rules for sold and listing data: `src/lib/sold.mjs`, `src/data/mls.ts`. Test lead forms only with
  `/api/lead` intercepted (the site check does this); never create test leads in Follow Up Boss.
- TCPA (call/text consent): every form that asks for a phone number gets the unchecked, optional consent box with the
  exact words in `src/lib/consent.mjs` (change them only with the attorney's sign-off, and bump CONSENT_VERSION).
  Automated calls/texts only to people tagged "Call/text consent". `scripts/site-check/tcpa.cjs` checks all of this
  (in preflight, monthly in GitHub Actions, and in the monthly TCPA routine).
- Repliers `map` takes ONE ring; extra rings are read as holes (`src/lib/hull.mjs`).
- Don't open pull requests unless asked. Commit messages end with the Co-Authored-By and Claude-Session lines.
- More background: `docs/site-plan.md`.
