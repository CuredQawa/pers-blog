# Changelog

All notable changes to this project are documented in this file.

## [1.0.0] - 2026-07-24

### Added

- Added the `/showcase/` personal showcase as the first navigation item while preserving all existing menu entries and routes.
- Migrated the original personal site's active homepage content, illustrations, Space Grotesk fonts, accordion, quote slider, and contact form into the blog project.
- Added a data-driven About card template inspired by the Fuwari About layout.
- Added support for optional local or remote images in About cards through `src/data/about-cards.ts`.
- Added movable `::about-cards` Markdown directives, including optional per-section placement.

### Changed

- Wrapped the personal showcase in one full-length Fuwari card while retaining the original Positivus content and visual style inside it.
- Added responsive padding and spacing for the showcase on phone, tablet, and desktop viewports.
- Increased About card size and changed the grid to one column on phones and two columns on larger screens.
- Made About card placement controlled directly from `src/content/spec/about.md`.
- Updated the package version to `1.0.0`.

### Fixed

- Added reversible sidebar slide and grid expansion transitions when entering or leaving the showcase.
- Preserved the sidebar slide transition on narrow desktop and mobile viewports.
- Kept the profile, categories, and tags visible on all normal blog pages.
- Prevented fixed Positivus spacing from squeezing text, accordions, and form controls on narrow screens.
- Prevented open accordion content from being clipped after mobile viewport changes.
- Preserved sticky sidebar behavior outside the showcase.
- Removed an invisible mobile navbar hit area after the navbar is hidden.
- Fixed Tailwind cross-file `@apply` dependencies so production builds complete reliably.
- Fixed About images not appearing from configured public image paths.
- Added automatic development reloads for About card data and image changes.
- Added local image URL versioning to prevent stale browser and CDN caches.
- Invalidated Astro's compiled About content cache whenever card data or images change.
