# TCPA compliance: website and lead follow-up (October 27, 2026)

This is a working checklist, not legal advice. Have the team's attorney (or KW Preferred Realty's compliance contact) review this document, the consent wording in `src/lib/consent.mjs`, `/privacy` and `/sms-terms` before launch.

## The rules that matter for us (plain English)

- **Automated or AI calls and texts need written consent.** Marketing calls or texts sent with an autodialer, auto-texting, or an artificial, prerecorded or AI-generated voice need the person's prior express written consent. The FCC confirmed in February 2024 that AI-generated voices count as "artificial". That consent must:
  - be clear and on the form itself (not buried in a privacy policy);
  - name who will contact them;
  - cover the phone number they give;
  - say consent isn't a condition of buying anything.
- **Opt-outs.**
  - People may revoke consent by any reasonable means: a STOP-type reply, telling an agent, email, and so on.
  - It must be honored within 10 business days. FCC rule, in effect since April 11, 2025.
  - One confirmation text is allowed.
- **Do Not Call.**
  - Telemarketing calls to numbers on the National Do Not Call Registry are allowed only:
    - with written consent; or
    - within 3 months of the person's inquiry (an "established business relationship"); or
    - within 18 months of a transaction.
  - Keep an internal do-not-call list.
  - Call between 8 AM and 9 PM in the person's time zone.
- **Minnesota.** Minnesota has its own limits on automatic dialing-announcing devices (Minn. Stat. 325E.26–.31). Ask the attorney whether anything beyond the federal rules applies to our prerecorded or AI calls.
- **Text carriers.** Business texting (A2P 10DLC registration, through Follow Up Boss or Ylopo) requires:
  - an opt-in checkbox;
  - SMS terms (program description, frequency, rates, STOP and HELP);
  - a privacy policy saying mobile numbers aren't shared for marketing.

## What the website now does

| Item | Where |
|---|---|
| Every form has one unchecked, optional box naming Huerkamp Home Group (KW Preferred Realty) and its agents. It covers calls and texts, including automated technology and artificial or prerecorded voice, to the number entered. It says consent is not required to submit or to buy or sell. It gives frequency, rates, STOP, HELP, "or tell us any other way", and links to the SMS Terms and Privacy Policy. | `src/lib/consent.mjs`, added to every form by `src/layouts/Base.astro` |
| Under the box: submitting alone means email or personal-call replies only, never automated calls or texts. | same |
| Consent counts only if a phone number was entered. | `src/lib/lead.mjs` |
| Follow Up Boss tags: **Call/text consent** (and the older **SMS consent**) when the box was checked; **No call/text consent** when a phone was given without it. | `src/lib/lead.mjs` |
| The lead's note in Follow Up Boss records the exact wording agreed to, its version, the time, the phone number and the IP address. | `src/lib/lead.mjs` |
| A separate copy of every consent goes to the website's own store, which Follow Up Boss edits can't change. It holds the wording, version, time, phone, email, name, form, page, IP and browser. | Netlify Blobs store `consent-records`, written by `netlify/functions/lead.mjs` |
| The website has its own Privacy Policy (`/privacy`) and SMS Terms (`/sms-terms`). Forms and the footer link to them, replacing the link to Ylopo's policy. | `src/pages/privacy.astro`, `src/pages/sms-terms.astro` |

If the wording ever changes, update `CONSENT_VERSION` so older records keep the wording those people actually saw.

## What the team has to set up (outside the website)

1. **Automations: the biggest risk.** Only people tagged **Call/text consent** may be:
   - put on any Follow Up Boss action plan that sends texts;
   - auto-texted or AI-called by Ylopo (Raiya or similar);
   - called with a dialer that dials automatically or leaves prerecorded voicemails.

   Everyone else gets email and personal, hand-dialed calls only. Check every action plan and lead flow, and ask Ylopo in writing how its AI decides whom to text or call.
2. **Ylopo's own forms** (home search, Facebook and Google ads). Their consent language is in their privacy policy, which isn't enough by itself. Ask Ylopo to confirm in writing that their forms:
   - show the consent on the form;
   - name Huerkamp Home Group / KW Preferred Realty;
   - cover AI voice;
   - accept any reasonable opt-out.

   Their policy currently says people must "only use the term Stop", which conflicts with the FCC's 2025 opt-out rule.
3. **Opt-outs.** When someone says stop in any way (text, call, email), mark them Do Not Text / Do Not Call in Follow Up Boss the same day, and remove them from action plans and Ylopo. FCC deadline: 10 business days.
4. **Do Not Call.**
   - Scrub numbers against the National Do Not Call Registry before cold calls. This includes old leads, sphere lists and anyone past 3 months since their inquiry who never gave written consent.
   - Keep the internal do-not-call list in Follow Up Boss.
5. **Calling hours.** 8 AM to 9 PM in the person's local time, including automated texts.
6. **Old leads.** Leads from before October 27, 2026 have no consent record from this website. Treat them as **no consent** for automated calls and texts unless another record proves otherwise.
7. **Text registration.** Confirm the team's texting numbers in Follow Up Boss and Ylopo are A2P 10DLC registered. Give the registration `https://www.huerkamphomegroup.com/privacy` and `/sms-terms` once the site is live.
8. **Records.** Keep consent and opt-out records at least 5 years (the TCPA allows lawsuits for 4). The website keeps its copy indefinitely.
