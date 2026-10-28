#!/usr/bin/env bash
# Daily security check for the HHG recruiting site.
# Exit code 0 = clean, 1 = problems found that need a human.
set -u
cd "$(dirname "$0")/.."
fail=0
say() { printf '\n== %s\n' "$1"; }

say "1. Dependency vulnerabilities (npm audit)"
if ! npm audit --audit-level=low 2>&1 | grep -v -i 'undici\|trace-warn'; then :; fi
if npm audit --audit-level=low >/dev/null 2>&1; then echo "OK: no known vulnerabilities"; else
  echo "Found vulnerabilities, trying safe (non-breaking) fixes..."
  npm audit fix 2>&1 | grep -v -i 'undici\|trace-warn' | tail -5
  if npm audit --audit-level=low >/dev/null 2>&1; then echo "FIXED: npm audit fix cleared them"; else
    echo "NEEDS ATTENTION: vulnerabilities remain (may need a major upgrade)"; fail=1; fi
fi

say "2. Outdated core packages"
npm outdated next react react-dom 2>&1 | grep -v -i 'undici\|trace-warn' || true

say "3. Secrets and risky files"
if git ls-files | grep -E '(^|/)\.env($|\.)' | grep -v '\.env\.example$'; then echo "NEEDS ATTENTION: .env file is tracked"; fail=1; else echo "OK: no .env files tracked"; fi
if grep -rnEI "(api[_-]?key|secret|token|password)[\"']?\s*[:=]\s*[\"'][A-Za-z0-9_\-]{16,}" app public scripts next.config.js package.json 2>/dev/null | grep -v 'process.env'; then echo "NEEDS ATTENTION: possible hard-coded secret"; fail=1; else echo "OK: no hard-coded secrets found"; fi
if grep -rnE "dangerouslySetInnerHTML|eval\(|document\.write|\.innerHTML" app 2>/dev/null; then echo "NEEDS ATTENTION: risky pattern in code"; fail=1; else echo "OK: no risky code patterns"; fi
if grep -rn 'target="_blank"' app --include=*.js | grep -v noopener; then echo "NEEDS ATTENTION: external link missing rel=noopener"; fail=1; else echo "OK: external links use noopener"; fi

say "4. Security headers configured"
for h in "Content-Security-Policy" "Strict-Transport-Security" "X-Content-Type-Options" "X-Frame-Options" "Referrer-Policy" "Permissions-Policy"; do
  grep -q "$h" next.config.js && echo "OK: $h" || { echo "MISSING: $h"; fail=1; }
done

say "5. Build"
if npm run build >/tmp/hhg-build.log 2>&1; then echo "OK: build passes"; else echo "NEEDS ATTENTION: build failed"; tail -20 /tmp/hhg-build.log; fail=1; fi

say "Result"
[ "$fail" = 0 ] && echo "CLEAN" || echo "ISSUES FOUND"
exit $fail
