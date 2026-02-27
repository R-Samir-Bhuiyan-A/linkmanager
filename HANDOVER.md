# LinkManager Handover Document

This document serves as a comprehensive handover of all architectural changes, bug fixes, and configuration updates performed on the **Eksses LinkManager** repository during this development session.

## 🏗️ Architectural & Configuration Changes

### 1. Unified Local Development (Vite Proxy)

The frontend and backend were previously disjointed, leading to CORS issues and hardcoded port bindings.

- **Vite Proxy Built:** Configured `client/vite.config.js` to proxy all `/api` and `/v1` traffic directly to the unified backend running on port `6997`.
- **Environment Variables:** Corrected `.env` pathing. Both the `server` (via `dotenv` path config) and `client` (via Vite `envDir`) now correctly load their configurations from the root directory's `.env` file instead of looking in their respective subfolders.

### 2. Vercel Deprecation

The user requested the removal of Vercel-specific deployment constraints to prepare for standard self-hosting/monolith deployment.

- **Removed Files:** Deleted `vercel.json` and `middleware.js` from the root directory.
- **Backend Cleaned:** Removed Vercel-specific Express configurations like `app.set('trust proxy', 1)` from `server/index.js` and bypassed the Vercel-only backup disable logic in the `BackupService`.

### 3. Default Credentials

- Updated the fallback fallback administrator credentials in `server/routes/auth.js` and `.env.example` from `admin:samir` to the standard `admin:admin` to ensure smooth local onboarding.

## 🐛 Bug Fixes & Code Standardization

### 1. Hardcoded Localhost Removal

Multiple components across the application were hardcoding `http://localhost:5000`, causing `ERR_CONNECTION_REFUSED` since the backend was running on port 6997 and proxying dynamically.

- **Refactored `client/src/api.js`**: Set `baseURL` definitively to `/api`.
- **`Dashboard.jsx`**: Replaced raw `axios.get('http://localhost:5000...')` with the centralized `api` wrapper, resolving silent data loss and `"No routes matched location /undefined"` React Router crashes.
- **`ProjectCreate.jsx`**: Replaced a raw POST to port 5000 with the `api.post` interceptor.
- **`ApiPlayground.jsx`**: Transitioned target URLs from absolute `http://localhost:5000` to relative paths spanning both the `/api` internal structure and the public `/v1` endpoints.

### 2. Duplicate API Path Routing (404s)

- **`LicensesTab.jsx` Fix**: Removed redundant static `/api` prefixes in fetch strings (e.g., changing `/api/licenses` to `/licenses`). Because the `api.js` interceptor inherently injects `/api`, the previous implementation resulted in duplicate `api/api/licenses/` 404 routes.
- **`/v1` Playground Traffic**: Reactivated native `axios` strictly within `ApiPlayground.jsx` for executing public `/v1` queries. This bypasses the default `/api` interceptor, preventing malformed paths like `/api/v1/heartbeat`.

### 3. Mongoose Deprecation Warnings

The Node backend console was spamming deprecation warnings regarding the usage of `{ new: true }` in `findOneAndUpdate` operations.

- Modernized all four data models across `BackupService.js`, `configs.js`, `client.js`, and `tracker.js` by standardizing the option object to strictly use `{ returnDocument: 'after' }`.

## 📦 Source Control & Contributions

- **Repository Forked**: Created a local fork (`Carloplayz/linkmanager`) due to restricted remote write access.
- **Branch Created**: All code changes generated in this session were isolated to the `fix/api-networking` branch.
- **Pull Request Submitted**: Successfully drafted and dispatched **Pull Request #1** to the upstream `R-Samir-Bhuiyan-A/linkmanager` repository containing all proxy and deprecation fixes for the real owner to review and merge into the principal codebase.

## ⚠️ Known Bugs & Non-Issues

The following console messages were observed during development but determined to be harmless or external to the LinkManager codebase:

1. **Bootstrap Autofill Overlay (`Uncaught TypeError: Failed to construct 'URL'`)**
   - **Diagnosis**: This error originates entirely from a third-party browser extension (specifically related to password/autofill overlays injecting iframes into the React DOM) and does not indicate failing React logic.
2. **Transient 500 Route Errors on Save**
   - **Diagnosis**: Nodemon restarts the backend server immediately upon saving a file. If the frontend performs a hot-reload fetch a millisecond before the backend fully boots, an `ECONNREFUSED` or `socket hang up` occurs, resulting in a temporary `500 Internal Server Error`. This resolves inherently upon manual refresh or the subsequent automatic poll.
3. **React DevTools Notification**
   - **Diagnosis**: Standard development environment suggestion logged by `react-dom`; safely ignorable.

---

_Created automatically via development session handover._
