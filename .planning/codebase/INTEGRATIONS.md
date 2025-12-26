# External Integrations

**Analysis Date:** 2025-12-26

## APIs & External Services

**Payment Processing:**
- Not detected

**Email/SMS:**
- Not detected

**External APIs:**
- GitHub API (credentials stored, but no active API calls in codebase)
  - SDK/Client: None (credentials only)
  - Auth: Personal Access Token in `.env`
  - Usage: Likely for repository management/syncing (not implemented in current code)

## Data Storage

**Databases:**
- Not detected - All data hardcoded in JavaScript

**File Storage:**
- Not detected

**Caching:**
- Not detected

## Authentication & Identity

**Auth Provider:**
- Not applicable (static site, no user authentication)

**OAuth Integrations:**
- Not detected

## Monitoring & Observability

**Error Tracking:**
- Not detected (no Sentry, LogRocket, etc.)

**Analytics:**
- Not detected (no Google Analytics, Mixpanel, etc.)

**Logs:**
- Browser console only (no structured logging)

## CI/CD & Deployment

**Hosting:**
- Not configured (static HTML can be deployed anywhere)
- Suitable for: GitHub Pages, Netlify, Vercel, S3

**CI Pipeline:**
- Not detected (no GitHub Actions, CircleCI, etc.)

## Environment Configuration

**Development:**
- Required env vars: None for functionality (`.env` contains GitHub credentials for potential future use)
- Secrets location: `.env` (currently not gitignored - security concern)
- Mock/stub services: Not applicable

**Staging:**
- Not applicable

**Production:**
- No secrets management needed
- Static file deployment only

## Webhooks & Callbacks

**Incoming:**
- Not detected

**Outgoing:**
- Not detected

---

*Integration audit: 2025-12-26*
*Update when adding/removing external services*
