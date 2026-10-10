#!/bin/sh
# Deploy to https://tongshing.pages.dev (Cloudflare Pages). Only the site files are uploaded.
set -e
D=$(mktemp -d)
cp index.html personal.js xiyong.js "$D"/
cd "$D" && npx --yes wrangler pages deploy . --project-name tongshing --branch main --commit-dirty=true
rm -rf "$D"
