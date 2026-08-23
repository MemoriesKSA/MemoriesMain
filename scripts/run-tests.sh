#!/bin/sh
# Every offline test, one run, one exit code.
#
#   sh scripts/run-tests.sh
#
# Five test scripts are deliberately NOT in here. They call generateDraftGuide
# or the research pass for real, so each run costs API money and takes minutes.
# A blanket "run every scripts/test-*.ts" sweep quietly spends real money and
# competes with a warming run for the same API budget, which is exactly what
# happened once. Run these by hand, on purpose, one at a time:
#
#   npx tsx --env-file=.env.local scripts/test-budget-draft.ts
#   npx tsx --env-file=.env.local scripts/test-country-draft.ts
#   npx tsx --env-file=.env.local scripts/test-halal-research.ts
#   npx tsx --env-file=.env.local scripts/test-long-draft.ts
#
# (test-cache-expiry constructs a client but buys nothing, so it stays in.)
cd "$(dirname "$0")/.." || exit 1

LIVE="test-budget-draft test-country-draft test-halal-research test-long-draft"

fail=0
failed=""
for f in scripts/test-*.ts; do
  name=$(basename "$f" .ts)
  case " $LIVE " in *" $name "*) printf "%-28s %s\n" "$name" "skipped, costs money"; continue;; esac
  out=$(npx tsx --env-file=.env.local "$f" 2>&1)
  line=$(printf "%s" "$out" | grep -E "^[0-9]+/[0-9]+ passed" | tail -1)
  if [ -z "$line" ] || printf "%s" "$out" | grep -q "^FAIL"; then
    fail=1
    failed="$failed $name"
    line=${line:-"NO RESULT"}
    printf "%-28s %s  <-- FAILED\n" "$name" "$line"
  else
    printf "%-28s %s\n" "$name" "$line"
  fi
done

echo "---"
if [ $fail -eq 0 ]; then echo "ALL GREEN"; else echo "FAILED:$failed"; fi
exit $fail
