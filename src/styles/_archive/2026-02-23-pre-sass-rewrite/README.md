# Pre-Rewrite Style Archive (2026-02-23)

This archive captures the style pipeline and style consumers before the single-source Sass rewrite.

## Why this archive exists
- Preserve all pre-rewrite style sources and component/page style files.
- Allow fast rollback by copying files back to their original paths.
- Provide historical context for changes to Bootstrap theme source, table styling, and style loading strategy.

## Rollback
1. Restore selected files from this archive to repository root paths.
2. Re-run `npm run styles:build` (or previous equivalent) to regenerate CSS artifacts.
3. Verify routes `/sales`, `/staff`, `/patient`, `/ui/palette`, `/ui/fields`, `/sales/order/invoice`.

## Notes
- Snapshot commit created before rewrite: `chore(styles): snapshot pre-rewrite style state`.
- This archive is intentionally file-based and independent from Git history.
