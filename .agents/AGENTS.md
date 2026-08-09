# Project & NativePHP Rules

## NativePHP Mobile & Android Rules

### 1. Production Packaging Asset Exclusions
- Always exclude `public/hot` when bundling NativePHP applications for release or packaging (`native:package`). If `public/hot` is present, Laravel's `@vite` directive will generate dev-server script links (`http://127.0.0.1:5173`), resulting in a black screen when installed on physical devices or release builds.
- Ensure `npm run build` is run prior to release packaging so `public/build/manifest.json` and static assets are fresh.

### 2. PHP 8 Exception Handling in Controllers
- Catch `\Throwable` instead of `\Exception` in Laravel controller endpoints serving Inertia pages or NativePHP WebView APIs. PHP 8 type errors and engine failures throw `\TypeError` / `\Error`, which do not inherit from `\Exception`.

### 3. Safe JavaScript Bridge Injections in Android WebViews
- Always perform safety function checks (`typeof originalXHRSend === 'function'`) before invoking overridden native prototypes in WebView JS script injections to prevent uncaught promise crashes during XHR/Fetch interception.

### 4. Release Versioning & In-Place Upgrades
- When packaging NativePHP mobile applications, `version_code` in `config/nativephp.php` MUST be explicitly incremented (integer > previous release) and `version` updated from `'DEBUG'` to a valid semantic version string (e.g., `'1.0.1'`). This ensures Android's Package Installer performs an in-place upgrade without requiring uninstallation.

### 5. Mobile Layout & Sticky Modal Footers
- All multi-input or scrollable modals (such as workout template creation/editing) MUST place primary action buttons (`Save`, `Submit`, `Cancel`) in a sticky bottom footer (`sticky bottom-0 z-20 bg-slate-950 px-6 py-4 shadow-2xl`). This guarantees action buttons remain visible and accessible on smaller mobile viewports regardless of scroll depth.

### 6. Authenticated Route Redirection
- Visiting the root URL (`/`) while authenticated MUST immediately redirect to the main app dashboard (`/dashboard`) rather than rendering a public landing or welcome page.

