# CLAUDE.md — EngrAssist Project Guide

## Project Overview

EngrAssist is a static HTML website providing engineering design tools (calculators, references, guides) for HVAC/Mechanical, Electrical, and Plumbing disciplines. It is deployed to Google Cloud Storage and served at https://engrassist.com.

## Tech Stack

- **HTML5** — 80+ static pages, no frontend framework
- **CSS3** — Single monolithic stylesheet (`styles.css`, ~7,000 lines)
- **Vanilla JavaScript (ES6+)** — Single main script (`scripts.js`, ~11,600 lines)
- **Node.js 18** — Build tooling only (code obfuscation)
- **GitHub Actions** — CI/CD to Google Cloud Storage
- **External services:** Google Analytics 4, Google AdSense, Google Sign-In, Cloudflare Workers

## Repository Structure

```
/                         Root — all HTML pages, styles.css, scripts.js
├── images/               Static image assets
├── articles/             Educational HTML articles (air-handling-units, boilers, etc.)
├── src/                  Source code (editable originals, e.g. load_calculation.js)
├── build/                Build scripts (obfuscate.js)
├── cloudflare-worker/    Cloudflare Workers config
├── .github/workflows/    deploy.yml — CI/CD pipeline
├── header.html           Shared header template (loaded dynamically)
├── footer.html           Shared footer template (loaded dynamically)
├── styles.css            Universal stylesheet — used by ALL pages
├── scripts.js            Universal script — used by ALL pages
└── load_calculation.js   Obfuscated output (DO NOT edit — edit src/ instead)
```

## Critical Rules

### Shared Files — Do Not Break Other Pages

`styles.css` and `scripts.js` are loaded by **every page** on the site. When modifying them:

- **Never remove or rename** existing CSS classes or JS functions — other pages depend on them.
- **Add new styles/functions** rather than modifying existing ones when building page-specific features.
- **Scope page-specific CSS** using a page-level class or ID (e.g., `.my-page-name .widget { ... }`).
- **Scope page-specific JS** by checking the page context before executing (e.g., check for a specific element's existence with `document.getElementById()` or `document.querySelector()` before attaching behavior).
- **Test across pages** — at minimum verify the homepage, one mechanical page, one electrical page, and one plumbing page still render correctly after changes.

### Source Code Protection

- **Never edit** `/load_calculation.js` directly — it is auto-generated.
- **Edit** `/src/load_calculation.js` and run `npm run build` to regenerate the obfuscated version.

## Page Structure Convention

Every HTML page follows this pattern:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- SEO: title, description, canonical, OG tags, Twitter cards -->
    <link rel="preload" href="styles.css" as="style">
    <link rel="preload" href="scripts.js" as="script">
    <link rel="stylesheet" href="styles.css">
    <script src="scripts.js" defer></script>
</head>
<body>
    <div id="header-placeholder"></div>
    <!-- Page content -->
    <div id="footer-placeholder"></div>
</body>
</html>
```

- Header and footer are **dynamically loaded** from `header.html` and `footer.html` via `loadTemplate()` in `scripts.js`.
- All scripts use the `defer` attribute.
- Preload directives are included for `styles.css` and `scripts.js`.

## Naming Conventions

| Element         | Convention   | Example                          |
|-----------------|-------------|----------------------------------|
| HTML files      | snake_case  | `load_calculation.html`          |
| CSS classes     | kebab-case  | `.hero-section`, `.service-box`  |
| CSS IDs         | kebab-case  | `#header-placeholder`            |
| JS functions    | camelCase   | `loadTemplate()`, `initializeAuth()` |
| JS variables    | camelCase   | `currentPage`, `searchResults`   |
| Image files     | Mixed       | `Mechanical_Room_1000.png`       |

## CSS Architecture

- **Single file:** All styles live in `styles.css`.
- **Logical sections:** Grouped by feature with comment headers.
- **Color palette:** Blues (`#1e3c72`, `#2a5298`), Orange (`#f39c12`), Red (`#e74c3c`).
- **Responsive breakpoints:** 480px (mobile), 768px (tablet), 1024px (desktop).
- **Mobile-first** approach — base styles are mobile, media queries add desktop behavior.

### Adding Page-Specific Styles

Append new styles to the **end** of `styles.css`. Scope them:

```css
/* ===== My New Page ===== */
.my-new-page .widget {
    /* styles only apply inside an element with class "my-new-page" */
}
```

## JavaScript Architecture

- **Single file:** All shared logic lives in `scripts.js`.
- **Key systems:** Template loading, breadcrumbs, authentication (Google Sign-In), search, mobile menu, calculator framework, Service Worker registration, Google Analytics.
- **Initialization pattern:** Features use `initialize{Feature}()` functions.
- **Calculator pattern:** Pages call `initializeCalculator()` and define page-specific logic.

### Adding Page-Specific JavaScript

Append new functions to the **end** of `scripts.js`. Guard execution:

```javascript
// Only runs on pages that have the specific element
const myWidget = document.getElementById('my-widget');
if (myWidget) {
    // page-specific logic here
}
```

## Build & Deploy

### Local Build

```bash
npm install            # Install dependencies (javascript-obfuscator)
npm run build          # Obfuscate src/load_calculation.js → load_calculation.js
```

### Deployment

Automated via GitHub Actions on push to `main`:

1. Checkout → Install deps → `npm run build`
2. Gzip compress CSS/JS
3. Authenticate to Google Cloud
4. `gsutil rsync` to GCS bucket (excludes `.git/`, `src/`, `build/`, `node_modules/`, etc.)
5. Apply cache headers (CSS/JS: 1 year, HTML: 1 day, images: 1 year)

### Files Excluded from Deployment

`.git/`, `.github/`, `src/`, `build/`, `node_modules/`, `package.json`, `package-lock.json`, `.gitignore`, `*.psd`, `*_old.*`, `*.sh`, `CLOUDFLARE.*`, `SETUP_GUIDE.md`, `SEO_SETUP.*`

## Navigation System

- **Header:** Logo, main menu (Home, Mechanical, Electrical, Plumbing, About, Contact), search bar, auth UI.
- **Breadcrumbs:** Auto-generated from the filename by `initializeBreadcrumbs()`.
- **Category hubs:** `mechanical_page.html`, `electrical_page.html`, `plumbing_page.html` — link to individual tools.
- **Search:** `performSearch()` searches across all tool names/descriptions.
- **Footer:** Privacy, Terms, Contact, Support links.

## Common Patterns

### Adding a New Calculator Page

1. Create a new `my_calculator.html` in the project root following the page structure convention above.
2. Add page-specific styles to `styles.css` scoped under a page class.
3. Add page-specific JS to `scripts.js` guarded by an element existence check.
4. Add the calculator to the appropriate category hub page (`mechanical_page.html`, `electrical_page.html`, or `plumbing_page.html`).
5. Add the tool to the search index in `scripts.js` (`performSearch` data).

### Adding an Article

1. Create a new `.html` file in the `/articles/` directory.
2. Follow the same page structure convention.
3. Use relative paths for CSS/JS: `href="../styles.css"`, `src="../scripts.js"`.
