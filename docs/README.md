# copilot-api-ghe documentation

Documentation for the Copilot API proxy for GitHub.com, GitHub Enterprise Cloud (`*.ghe.com`) and GitHub Enterprise Server.

| Document | What it covers |
| --- | --- |
| [architecture.md](architecture.md) | Components, authentication chain, request flows (with diagrams) |
| [endpoints.md](endpoints.md) | Every endpoint the proxy serves, with examples and quirks |
| [models-and-routing.md](models-and-routing.md) | How a model maps to an upstream endpoint, and when translation happens |
| [clients.md](clients.md) | Claude Code, Claude Desktop, OpenAI and Anthropic SDKs, environment variables |
| [operations.md](operations.md) | Install, run, Docker, flags, tokens, security |
| [troubleshooting.md](troubleshooting.md) | Error messages, causes and fixes |
| [openapi.yaml](openapi.yaml) | OpenAPI description of the proxy (also served at `/openapi.yaml`) |
| [upstream-copilot-api.openapi.yaml](upstream-copilot-api.openapi.yaml) | Reverse-engineered description of the upstream Copilot API. Operations carry `x-verified` |

The same material is available in the running proxy: open `/dashboard` and use the **Docs & Troubleshooting** tab.

## Keeping the docs up to date

The docs are part of the code. Update them in the same change that alters behavior.

| If you change... | Update... |
| --- | --- |
| A route in `src/server.ts` or a route handler | `endpoints.md`, `openapi.yaml`, the dashboard API Reference tab (`src/routes/dashboard/client.ts`) |
| Model routing, `passthrough.ts`, translation | `models-and-routing.md`, `architecture.md`, the routing diagram and table in `src/routes/dashboard/body.ts` |
| A CLI flag in `src/start.ts` or `src/auth.ts` | `operations.md` |
| Error messages | `troubleshooting.md` and the table in `src/routes/dashboard/body.ts` |
| Client setup (Claude Code, Desktop, SDKs) | `clients.md` and the Connect Clients tab |
| Upstream behavior you verified or disproved | `upstream-copilot-api.openapi.yaml` (`x-verified`) |

Two commands help:

```sh
npm run docs:sync    # regenerate src/routes/openapi/spec.ts from docs/openapi.yaml
npm run docs:check   # fail if routes, flags or the generated spec are not documented
```

`docs:check` runs in CI-style fashion: run it before every commit that touches routes, flags or `docs/openapi.yaml`.

Last full review: 2026-11-10 against a GHE Cloud tenant (live-verified endpoints are marked in the upstream spec).
