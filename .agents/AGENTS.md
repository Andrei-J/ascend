# Project & NativePHP Rules

## NativePHP Mobile & Android Rules

### 1. Production Packaging Asset Exclusions
- Always exclude `public/hot` when bundling NativePHP applications for release or packaging (`native:package`). If `public/hot` is present, Laravel's `@vite` directive will generate dev-server script links (`http://127.0.0.1:5173`), resulting in a black screen when installed on physical devices or release builds.
- Ensure `npm run build` is run prior to release packaging so `public/build/manifest.json` and static assets are fresh.

### 2. PHP 8 Exception Handling in Controllers
- Catch `\Throwable` instead of `\Exception` in Laravel controller endpoints serving Inertia pages or NativePHP WebView APIs. PHP 8 type errors and engine failures throw `\TypeError` / `\Error`, which do not inherit from `\Exception`.

### 3. Safe JavaScript Bridge Injections in Android WebViews
- Always perform safety function checks (`typeof originalXHRSend === 'function'`) before invoking overridden native prototypes in WebView JS script injections to prevent uncaught promise crashes during XHR/Fetch interception.
