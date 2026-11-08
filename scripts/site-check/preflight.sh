#!/usr/bin/env bash
# Pre-push check: test a change BEFORE it goes live (every push to the live branch deploys within minutes).
#   1. build the site with made-up sample homes (make-fixture.mjs; Netlify never uses them)
#   2. the launch checks (old addresses, broken internal links: scripts/check-launch.mjs)
#   3. serve the build on localhost (serve-dist.mjs; /api/* goes to the live site) and run the full site check on it
# Exit code 0 only when everything passes. Run from the repo folder:  bash scripts/site-check/preflight.sh
# Then push, and run scripts/site-check/after-deploy.sh to check the live site once Netlify has deployed it.
set -u
cd "$(dirname "$0")/../.."
PORT=4471
fail=0
echo "== 1/3 build with sample homes"
node scripts/site-check/make-fixture.mjs .cache/sample-listings.json >/dev/null 2>&1
if ! MLS_FIXTURE=.cache/sample-listings.json npx astro build > .cache/preflight-build.log 2>&1; then
  echo "FAIL  build — see .cache/preflight-build.log"; tail -20 .cache/preflight-build.log; exit 1
fi
grep -E "\[build\] Complete" .cache/preflight-build.log | tail -1
echo "== 2/3 launch checks"
node scripts/check-launch.mjs > .cache/preflight-launch.log 2>&1 || { echo "FAIL  launch checks"; tail -15 .cache/preflight-launch.log; fail=1; }
tail -2 .cache/preflight-launch.log
echo "== 3/3 site check on the local build"
node scripts/site-check/serve-dist.mjs $PORT > /dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
for i in $(seq 1 30); do curl -s -o /dev/null "http://localhost:$PORT/" && break; sleep 0.5; done
for browser in ${BROWSERS:-chromium}; do
  SITE_BASE="http://localhost:$PORT" BROWSER=$browser timeout 900 node scripts/site-check/smoke.cjs 2>&1 | grep -v "UNDICI\|trace-warn\|EnvHttpProxyAgent" | tee .cache/preflight-smoke-$browser.log
  grep -q "^FAIL" .cache/preflight-smoke-$browser.log && fail=1
done
if [ $fail = 0 ]; then echo "PREFLIGHT PASSED: OK to push"; else echo "PREFLIGHT FAILED: fix before pushing"; fi
exit $fail
