<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.

<!-- LOVABLE:END -->

- Learning app code lives in src/components/neet and src/lib/neet. Course lessons/labs stay static in src/lib/neet/content.ts with progress in browser localStorage; the knowledge pack (articles, sources, prompts, roles, coverage, audit, metadata) lives in Lovable Cloud tables with public read-only RLS and is read via server functions in src/lib/neet/library.functions.ts. Why: pack content is large and queryable; personal progress needs no account.
- Raw pack files live in content/pack; re-import with scripts/load-content.py (upserts via service role). Why: keeps the database reproducible from source files.
- Accounts: Cloud email auth; per-user data (profiles, learning_goals, progress_events) is owner-only RLS, accessed via src/lib/neet/account.functions.ts returning typed { data, error }. Browser progress emits `neet:progress` events that ProgressSync forwards/backfills. Why: progress follows the user across devices while lessons stay static.
- Signed-in pages (/me, /me/calibration, lessons) live under src/routes/_authenticated. ASCII effects (src/components/neet/ascii.tsx) run client-only; the particle backdrop is home-page only.
