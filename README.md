# plugin-grade-7-physics-gravity

Standalone lecture-plugin repo for **`grade-7.physics.gravity`**, deployed to the ed-tech
platform via jsDelivr. Generated from the monorepo by
`scripts/create-plugin-repo.mjs` — edit the source in the monorepo and
regenerate, or iterate here and copy back.

## How it ships

`main` holds source only. Pushing to `main` runs `.github/workflows/publish.yml`,
which:

1. type-checks and builds the bundle (`pnpm build:github` → `dist/`),
2. if `package.json`'s version has no `v<version>` tag yet, publishes a
   `v<version>` tag whose tree contains the built `dist/`, and
3. registers the jsDelivr URLs with the platform's `/api/registry/publish`.

jsDelivr then serves the immutable bundle:

```
https://cdn.jsdelivr.net/gh/<owner>/plugin-grade-7-physics-gravity@v<version>/dist/index.js
```

To publish a new version: bump `version` in `package.json` (and `manifest.json`)
and push to `main`.

## Required repo configuration

If this repo was created with `create-plugin-repo … --push`, both entries below
were already set for you. Otherwise, Settings → Secrets and variables → Actions:

| Kind     | Name                   | Value                                            |
| -------- | ---------------------- | ------------------------------------------------ |
| Variable | `PLATFORM_URL`         | Platform origin, e.g. `https://your-platform.app`|
| Secret   | `PLUGIN_PUBLISH_TOKEN` | Must equal the platform's `PLUGIN_PUBLISH_TOKEN` |

The platform must have `PLUGIN_GITHUB_OWNER` set to this repo's owner so its
publish endpoint accepts these jsDelivr URLs.

## Local development

```bash
pnpm install
pnpm typecheck
pnpm build:github   # produces dist/{index.js, manifest.json, styles.css}
```
