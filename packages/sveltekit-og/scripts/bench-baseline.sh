#!/usr/bin/env bash
# Records benchmarks/baseline.json + cold-baseline.json for an older release's
# library source, built and measured with THIS checkout's toolchain (Kit, Vite,
# vitest, bench files). Only src/lib differs from a normal run, so a compare
# measures code changes, not toolchain changes. Used by CI and for local baselines.
#
#   bash scripts/bench-baseline.sh [ref]   # default v4.4.0; run from anywhere

set -euo pipefail
REF="${1:-v4.4.0}"
PKG=packages/sveltekit-og
ROOT=$(git rev-parse --show-toplevel)
WT="$(mktemp -d)/base"

git -C "$ROOT" worktree add -q --detach "$WT" HEAD
trap 'git -C "$ROOT" worktree remove --force "$WT"' EXIT

cd "$WT"
git rm -rq "$PKG/src/lib"
git checkout "$REF" -- "$PKG/src/lib"
# Kit 3 replaced the $lib alias with package.json "#lib" imports
find "$PKG/src/lib" -type f -exec perl -pi -e 's|\$lib/|#lib/|g' {} +

pnpm install --frozen-lockfile
cd "$PKG"
pnpm package
pnpm bench:save
node benchmarks/cold.mjs --save
cp benchmarks/baseline.json benchmarks/cold-baseline.json "$ROOT/$PKG/benchmarks/"
echo "baseline for $REF → $PKG/benchmarks/"
