#!/usr/bin/env bash
# After-deploy check: wait until Netlify has deployed the commit just pushed, then run the full site check on the live
# site. If it fails, undo the change right away (git revert <commit> and push) and fix it before trying again.
# Run from the repo folder after pushing:  bash scripts/site-check/after-deploy.sh
set -u
cd "$(dirname "$0")/../.."
SITE=https://www.huerkamphomes.com
PUSHED=$(date -u +%s)
echo "Waiting for the deploy of $(git log -1 --format='%h %s' | cut -c1-80) ..."
HEAD_SHA=$(git rev-parse HEAD)
# /mls-status.json is written by every build. It names the commit Netlify built; wait until that commit includes the
# one just pushed (a scheduled routine may push right before or after us). Builds from before that field existed
# only have builtAt, so fall back to it.
for i in $(seq 1 60); do
  status=$(curl -s "$SITE/mls-status.json?t=$RANDOM")
  live=$(echo "$status" | grep -o '"commit": *"[0-9a-f]*"' | grep -o '[0-9a-f]\{40\}')
  built=$(echo "$status" | grep -o '"builtAt": *"[^"]*"' | grep -o '[0-9T:.-]*Z')
  if [ -n "$live" ]; then
    git cat-file -e "$live" 2>/dev/null || git fetch -q origin "$(git rev-parse --abbrev-ref HEAD)" 2>/dev/null
    if git merge-base --is-ancestor "$HEAD_SHA" "$live" 2>/dev/null; then echo "Live build of ${live:0:7} from $built; waiting 90 s for the servers to settle"; sleep 90; break; fi
  elif [ -n "$built" ] && [ "$(date -u -d "$built" +%s)" -ge "$((PUSHED - 60))" ]; then echo "Live build from $built; waiting 90 s for the servers to settle"; sleep 90; break; fi
  sleep 30
done
timeout 900 node scripts/site-check/smoke.cjs 2>&1 | grep -v "UNDICI\|trace-warn\|EnvHttpProxyAgent" | tee .cache/after-deploy.log
if grep -q "^FAIL" .cache/after-deploy.log; then
  echo "AFTER-DEPLOY CHECK FAILED: revert the last commit now (git revert --no-edit HEAD && git push), then fix it."
  exit 1
fi
echo "AFTER-DEPLOY CHECK PASSED"
