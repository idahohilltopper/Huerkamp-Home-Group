#!/usr/bin/env bash
# After-deploy check: wait until Netlify has deployed the commit just pushed, then run the full site check on the live
# site. If it fails, undo the change right away (git revert <commit> and push) and fix it before trying again.
# Run from the repo folder after pushing:  bash scripts/site-check/after-deploy.sh
set -u
cd "$(dirname "$0")/../.."
SITE=https://www.huerkamphomes.com
PUSHED=$(date -u +%s)
echo "Waiting for the deploy of $(git log -1 --format='%h %s' | cut -c1-80) ..."
# /mls-status.json is written by every build; its builtAt changes when the new deploy is live.
for i in $(seq 1 60); do
  built=$(curl -s "$SITE/mls-status.json?t=$RANDOM" | grep -o '"builtAt": *"[^"]*"' | grep -o '[0-9T:.-]*Z')
  if [ -n "$built" ] && [ "$(date -u -d "$built" +%s)" -ge "$((PUSHED - 60))" ]; then echo "Live build from $built; waiting 90 s for the servers to settle"; sleep 90; break; fi
  sleep 30
done
timeout 900 node scripts/site-check/smoke.cjs 2>&1 | grep -v "UNDICI\|trace-warn\|EnvHttpProxyAgent" | tee .cache/after-deploy.log
if grep -q "^FAIL" .cache/after-deploy.log; then
  echo "AFTER-DEPLOY CHECK FAILED: revert the last commit now (git revert --no-edit HEAD && git push), then fix it."
  exit 1
fi
echo "AFTER-DEPLOY CHECK PASSED"
