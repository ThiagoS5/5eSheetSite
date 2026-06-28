# Design-Sync Notes

## Re-sync workaround: `--entry` flag required

**Symptom:** Running `resync.mjs` without `--entry` fails with:
```
ENOENT: node_modules/ficha-5e-app/package.json
```

**Root cause:** The re-copied scripts call `exportedNames(PKG_DIR, pkgJson)` at `package-build.mjs:243`. Without `--entry`, `PKG_DIR = join(NODE_MODULES, PKG) = node_modules/ficha-5e-app`, which doesn't exist because this app is not self-installed.

**Fix:** Always pass `--entry ./ds-bundle/.pkg-entry.mjs` to the resync command. The file does not need to exist — it gets deleted at build start, triggering the synth-entry fallback. The walk-up logic finds `package.json` in the repo root (whose `name` is `ficha-5e-app`), so `PKG_DIR` is set to the repo root correctly.

**Correct command:**
```sh
node .ds-sync/resync.mjs --entry ./ds-bundle/.pkg-entry.mjs
```

## CSS token class names: no `bg-tone-*-deepest`

The deepest tone variants do **not** exist as `bg-*` utility classes — they are gradient-only:
- `via-tone-crimson-deepest` ✓ (gradient stop)
- `bg-tone-crimson-deepest` ✗ (does not exist)

Use the `deep` (not `deepest`) variants for backgrounds:
- `bg-tone-arcane-deep` ✓
- `bg-tone-druid-deep` ✓
- `bg-tone-gold-deep` ✓

To verify, grep `ds-bundle/_ds_bundle.css` for the class name before authoring a convention.

## HoverTooltip RENDER_BLANK — pre-existing, non-blocking

The validate stage always reports:
```
! [RENDER_BLANK] components/molecules/HoverTooltip/HoverTooltip.html: renders but PNG is 4619B (<5KB — likely blank)
```

This is a pre-existing issue with the tooltip's auto-generated preview. It is non-blocking. To fix it: author `.design-sync/previews/HoverTooltip.tsx` — owned previews override generated ones.

## `.design-sync/.cache/remote-sync.json` — populate sourceHashes

After each successful upload, copy `ds-bundle/_ds_sync.json` to `.design-sync/.cache/remote-sync.json` (this file is gitignored). Without this, the diff will conservatively mark all 108 components as needing re-upload on every re-sync.

```sh
cp ds-bundle/_ds_sync.json .design-sync/.cache/remote-sync.json
```

## Symlink for overrides node_modules

The `.design-sync/overrides/` scripts use bare `import 'esbuild'` etc. They need a symlink at `.design-sync/node_modules` → `.ds-sync/node_modules`. Create with:

```powershell
New-Item -ItemType SymbolicLink -Path ".design-sync\node_modules" -Target "C:\Users\Thiago\OneDrive\Documentos\5e Fichas\.ds-sync\node_modules"
```

(Absolute target path required on Windows — relative paths fail here.)
