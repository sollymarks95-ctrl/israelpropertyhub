# RepHuby Intelligence — Claude Code Context

## Project
Next.js 16 app on Vercel. 9 financial news portals for SEO reputation management.
Client: Apex Markets FX (Forex broker)

## Stack
- **Frontend**: Next.js 16, Turbopack, TypeScript
- **DB**: Supabase (project: gykxxhxsakxhfuutgobb, eu-central-1)
- **Deploy**: Vercel (team_i0UdvDcC0rdntVBoxbP7i46X, prj_Kziy22RlbG1OFUJkWAA8SC3Gn9U5)
- **Domains**: rephuby.com (admin), nex-wire.com, finvexx.com, bizplezx.com, aurexhq.com, verivex.co, invexhuby.com, signalixx.com, execvex.com, cryptoxos.com

## Git — ALWAYS push after every change
```bash
git config user.email "solly@reputationhub.com"
git config user.name "Solly Marks"
git add -A
git commit -m "fix: description"
git push
```
Vercel auto-deploys from GitHub main branch (~60s build time).
Credentials are saved in git credential store — just run `git push`.

## Supabase
- All admin routes use NEXT_PUBLIC_SUPABASE_ANON_KEY (set in Vercel env vars)
- DO NOT use SUPABASE_SERVICE_ROLE_KEY — not set in Vercel, will break
- createClient must be INSIDE handler functions, never at module level

## Key files
- `app/api/admin/generate-video/route.ts` — Shotstack 3-camera video pipeline
- `app/api/admin/video-status/route.ts` — polls Shotstack render status
- `app/api/admin/test-pipeline/route.ts` — health check for all APIs
- `app/api/cron-site/route.ts` — article generator (runs every 6h, 9 portals)
- `app/portal/admin/VideoStudio.tsx` — video studio UI
- `app/globals.css` — mobile/desktop CSS toggles (critical — don't break)

## Video Pipeline (Shotstack)
- Endpoint: POST https://api.shotstack.io/edit/v1/render
- Auth: x-api-key header
- Key: stored in Supabase system_api_keys table as SHOTSTACK_KEY
- STRICT RULES — these cause validation errors if broken:
  - NO `fit` property on image assets (only on clips)
  - NO `transition.duration` (only `transition.in` and `transition.out`)
  - aspectRatio must be a plain string ('16:9') — never a function reference
  - NO `border` on image clips
  - HTML clip width/height must be numbers, not strings

## 9 Portals
| Slug | Domain | Template |
|------|--------|----------|
| global-trade-wire | nex-wire.com | WireTemplate |
| finance-terminal | finvexx.com | TerminalTemplate |
| business-pulse | bizplezx.com | MagazineTemplate |
| gold-markets-today | aurexhq.com | DataTemplate |
| trust-score | verivex.co | TrustTemplate |
| invest-data | invexhuby.com | DynamicTemplate |
| market-radar | signalixx.com | DynamicTemplate |
| executive-network | execvex.com | DynamicTemplate |
| crypto-hub | cryptoxos.com | DynamicTemplate |

## Admin panel
URL: rephuby.com/portal/admin
Tabs: VideoStudio, Podcasts, Articles, Settings

## Common gotchas
- Always add `export const dynamic = 'force-dynamic'` to API routes
- Mobile/desktop CSS uses class toggles — never break globals.css
- Shotstack image clips: asset only needs `type` and `src`
- All 9 portals share one Next.js codebase — changes affect all portals
