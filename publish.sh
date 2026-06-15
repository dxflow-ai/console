#!/usr/bin/env bash
set -euo pipefail

# Cut a new console release: optionally merge the current branch into main, bump
# the latest tag, build the static console, and publish a checksummed zip to this
# repo's GitHub Releases. The engine downloads the zip matching its own version
# at boot and verifies it against the .sha256, so release the console BEFORE the
# engine (they ship in lockstep).
#
# Usage: ./publish.sh

REMOTE="origin"
RELEASE_BRANCH="main"

die() { echo "Error: $*" >&2; exit 1; }
confirm() { read -rp "$1 [y/N]: " r; [[ "$r" == [yY] ]] || { echo "Aborted."; exit 0; }; }

# Preflight: tools present, run from the repo root, clean tree.
command -v git >/dev/null 2>&1             || die "git is required"
command -v gh  >/dev/null 2>&1             || die "gh (GitHub CLI) is required"
command -v pnpm >/dev/null 2>&1            || die "pnpm is required"
[[ -f package.json && -f nuxt.config.ts ]] || die "run from the console repo root"
[[ -z "$(git status --porcelain)" ]]       || die "working tree is not clean"

git fetch --quiet "$REMOTE" "$RELEASE_BRANCH"

# Releases are cut from main; merge the current branch in if we're elsewhere.
branch="$(git branch --show-current)"
if [[ "$branch" != "$RELEASE_BRANCH" ]]; then
    confirm "Merge '${branch}' into ${RELEASE_BRANCH} and release from there?"
    git checkout "$RELEASE_BRANCH"
    git merge --ff-only "${REMOTE}/${RELEASE_BRANCH}" || die "${RELEASE_BRANCH} diverged from ${REMOTE} — reconcile first"
    git merge --no-ff "$branch" -m "Merge ${branch} into ${RELEASE_BRANCH}" || die "merge failed — resolve conflicts and retry"
    git push "$REMOTE" "$RELEASE_BRANCH"
fi

# Local main must match origin so the tag lands on the published commit.
[[ "$(git rev-parse @)" == "$(git rev-parse "${REMOTE}/${RELEASE_BRANCH}")" ]] \
    || die "local ${RELEASE_BRANCH} is out of sync with ${REMOTE} — push or pull first"

# Current version = highest v* tag on the remote (or v0.0.0 if none yet).
current=$(git ls-remote --tags --refs "$REMOTE" 'v*' \
    | awk -F/ '{print $NF}' \
    | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' \
    | sort -t. -k1.2,1n -k2,2n -k3,3n \
    | tail -1 || true)
current=${current:-v0.0.0}

IFS='.' read -r major minor patch <<< "${current#v}"
patch_bump="v${major}.${minor}.$((patch + 1))"
minor_bump="v${major}.$((minor + 1)).0"
major_bump="v$((major + 1)).0.0"

echo
echo "Current release: ${current}"
echo "  1) patch → ${patch_bump}"
echo "  2) minor → ${minor_bump}"
echo "  3) major → ${major_bump}"
read -rp "Bump [1-3]: " choice
case "$choice" in
    1) tag="$patch_bump" ;;
    2) tag="$minor_bump" ;;
    3) tag="$major_bump" ;;
    *) echo "Cancelled."; exit 0 ;;
esac

git rev-parse -q --verify "refs/tags/${tag}" >/dev/null && die "tag ${tag} already exists"

confirm "Release ${tag}?"

# Build the static console.
pnpm install --frozen-lockfile
pnpm generate
[[ -d .output/public ]] || die "expected build output at .output/public"

# Package: zip the *contents* of .output/public (files at archive root) so the
# engine unpacks them flat, then checksum the archive.
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
asset="${work}/console-${tag}.zip"
( cd .output/public && zip -qr "$asset" . )
sha256="$(sha256sum "$asset" | cut -d' ' -f1)"
echo "$sha256" > "${asset}.sha256"

# Tag the release commit and publish the bundle.
git tag -a "$tag" -m "Release ${tag}"
git push "$REMOTE" "$tag"

notes="Static console bundle for the dxflow engine.

The engine downloads \`console-${tag}.zip\` at boot and verifies it against
\`console-${tag}.zip.sha256\` (SHA256 \`${sha256}\`). Released in lockstep with
the engine at the same version tag."

gh release create "$tag" "$asset" "${asset}.sha256" --title "$tag" --notes "$notes" 2>/dev/null \
    || gh release upload "$tag" "$asset" "${asset}.sha256" --clobber

echo "Published ${tag} (sha256 ${sha256})."
