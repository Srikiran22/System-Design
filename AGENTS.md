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

- Learning app code lives in `src/components/neet`, `src/routes/`, and `src/lib/neet/`. TanStack Start file routes render the public catalogue, knowledge library, exercises, projects, and authenticated lesson/progress pages. Curriculum reads and authoring are exposed through `curriculum.functions.ts` and validated by `curriculum-schemas.ts`: Supabase is used when configured; local development uses `node:sqlite`; versioned catalogues in `content.ts`, `competencies.ts`, and `rubrics.ts` provide seed/default fallback data. Published content is public; draft reads and CMS mutations are role-gated.
- Raw knowledge-pack files live in canonical `content/pack/`; `SS_content/` is the legacy mirror. `scripts/generate_source_enrichment.js` generates `src/lib/neet/sourceEnrichment.ts`. Re-import pack data with `scripts/load-content.py` through the approved Lovable Cloud workflow. Never hand-edit generated enrichment output.
- Accounts: production identity is verified through Supabase Auth; owner-scoped RLS protects profiles, learning goals, progress events, learner evidence, and learner snapshots. `account.functions.ts` handles the server contract. Browser state is namespaced per user; localStorage is a cache and durable outbox (`sync-outbox.ts`), not the production canonical store. `ProgressSync.tsx` forwards pending events/evidence/snapshots and removes only server-confirmed keys. Local SQLite and local-dev auth are development/test infrastructure only; local auth is disabled in production or when Supabase is configured.
- Signed-in pages (/me, /me/calibration, lessons) live under src/routes/_authenticated. ASCII effects (src/components/neet/ascii.tsx) run client-only; the particle backdrop is home-page only.
