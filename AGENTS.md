# Repository Guidelines

## Project Structure & Module Organization
- `src/app/` holds Next.js App Router routes, split into `(customer)`, `(admin)`, and `(web-admin)` experiences plus `api/` route handlers.
- `src/components/` contains shared UI and feature components; `src/components/ui/` is shadcn/ui.
- `src/lib/` centralizes integrations (LINE, Google APIs), calculations, and helpers; types live in `src/types/`.
- Static assets are in `public/`; operational docs live in `docs/`; scripts are in `scripts/` (for example `scripts/setup-spreadsheet.js`).

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run dev` starts the dev server on `http://localhost:5000`.
- `npm run build` creates the production build.
- `npm run start` runs the production server on port 5000.
- `npm run lint` runs ESLint with Next.js rules.
- `npm run db:push` and `npm run db:studio` use Drizzle tooling when database work is needed.

## Coding Style & Naming Conventions
- TypeScript is used throughout; keep files in `src/` and prefer `@/` path aliases (from `tsconfig.json`).
- Formatting matches existing code: 2-space indentation, double quotes, and React components in `*.tsx`.
- TailwindCSS + shadcn/ui are the primary styling tools; keep class ordering consistent with nearby files.
- User-facing text should be in Thai; keep identifiers and comments in English.

## Testing Guidelines
- No test framework or test directories are present. Use `npm run lint` for routine checks.
- If adding tests, keep them close to the feature (for example `src/lib/__tests__/`) and document how to run them.

## Commit & Pull Request Guidelines
- Recent Git history shows free-form messages and merge commits; no strict convention is enforced.
- When contributing, use concise, descriptive commit messages (for example `fix: handle LIFF auth redirect`).
- PRs should include a short summary, linked issues (if any), and screenshots for UI changes.

## Configuration & Integrations
- Copy `.env.example` to `.env.local` and fill in LINE, Google, and Slip2Go credentials.
- Google Sheets and Google Drive are primary data stores; keep sheet schema changes coordinated with `src/types/`.
