# bundle-sheriff · Stop shipping bloat.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
[![npm](https://img.shields.io/npm/v/@berkinduz/bundle-sheriff?logo=npm&color=cb3837)](https://www.npmjs.com/package/@berkinduz/bundle-sheriff)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)

`bundle-sheriff` is a zero-config-needed CLI that keeps your bundles lean. It scans your built JS/CSS, measures Raw/Gzip/Brotli sizes, and fails CI when budgets are exceeded—preventing regressions before they hit production.

Get it on npm: https://www.npmjs.com/package/@berkinduz/bundle-sheriff

## Why bundle-sheriff?

- Performance budgets catch bloat before customers do.
- Automated, repeatable checks in CI stop silent regressions.
- Works with any bundler—just point it at your build output.

## Features

- Compression support: Raw, Gzip, and Brotli measurements
- CI/CD ready: non-zero exit on failures
- Zero config by default, fully configurable via `sheriff.config.*`
- TypeScript-first codebase and typings

## Installation

```bash
npm install -D @berkinduz/bundle-sheriff
```

## Usage

Run directly (no global install required):

```bash
npx @berkinduz/bundle-sheriff check
```

What you’ll see (example):

```
┌──────────────────────┬─────────────┬────────┬────────┬────────┐
│ File                 │ Compression │ Actual │ Limit  │ Passed │
├──────────────────────┼─────────────┼────────┼────────┼────────┤
│ dist/app.js          │ gzip        │ 12.3 kB│ 20 kB  │ yes    │
│ dist/styles.css      │ brotli      │ 9.1 kB │ 8 kB   │ no     │
└──────────────────────┴─────────────┴────────┴────────┴────────┘
```

Exit codes: 0 when all budgets pass; 1 when any rule fails or no rules are defined (to keep CI strict).

## Configuration (important)

Create `sheriff.config.ts` (or `.js`/`.json`) in your project root:

```ts
// sheriff.config.ts
export default {
  rules: [
    {
      // Glob(s) of files to check
      path: "dist/**/*.js",
      // Human-friendly budget (parsed with bytes)
      maxSize: "150kb",
      // Which size to compare: raw | gzip | brotli (default: gzip)
      compression: "gzip",
    },
    {
      path: "dist/**/*.css",
      maxSize: "120kb",
      compression: "brotli",
    },
  ],
};
```

`BundleRule` interface:

```ts
interface BundleRule {
  path: string; // Glob pattern for files to check
  maxSize: string; // e.g., "150kb", "1.2mb"
  compression?: "raw" | "gzip" | "brotli"; // default: 'gzip'
}
```

## CI/CD Integration

Add a GitHub Actions workflow (runs after your build):

```yaml
name: bundle-sheriff

on:
  pull_request:
  push:

jobs:
  check-budgets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run build # your app build that emits dist/
      - run: npx bundle-sheriff check
```

CI will fail fast if any bundle exceeds its budget.

## Roadmap

- Framework adapters (Next.js, Vite, Remix) for zero-setup defaults
- Historical tracking to detect regressions over time
- Machine-readable reports (JSON) for custom dashboards

---

Stop shipping bloat. Keep your budgets honest with `bundle-sheriff`.
