# Architecture

The proxy is a small [Hono](https://hono.dev) server (`src/server.ts`) that makes GitHub Copilot look like the OpenAI and Anthropic APIs.

## Components

```mermaid
flowchart LR
  subgraph Clients
    CC[Claude Code]
    CD[Claude Desktop]
    SDK[OpenAI / Anthropic SDKs, Cursor]
    CURL[curl, scripts]
    WEB[Browser dashboard]
  end

  subgraph Proxy["copilot-api-ghe (port 4141)"]
    ROUTES["Hono routes<br/>/v1/* /dashboard /usage /openapi.yaml"]
    GUARD["Rate limit and manual approval<br/>(optional)"]
    ROUTER["Router<br/>model.supported_endpoints"]
    MODELS["Model cache<br/>GET /models at startup"]
    CTOKEN["Copilot token<br/>auto-refresh"]
    GTOKEN[("github_token file")]
  end

  subgraph GitHub["GitHub (GHE)"]
    GAPI["api.company.ghe.com<br/>/copilot_internal/v2/token<br/>/copilot_internal/user"]
    LOGIN["company.ghe.com<br/>/login/device"]
  end

  CAPI["Copilot API (CAPI)<br/>copilot-api.company.ghe.com"]

  CC --> ROUTES
  CD --> ROUTES
  SDK --> ROUTES
  CURL --> ROUTES
  WEB --> ROUTES
  ROUTES --> GUARD --> ROUTER
  ROUTER --> MODELS
  ROUTER -->|Bearer| CAPI
  CTOKEN --> GAPI
  GTOKEN --> CTOKEN
  LOGIN -.sign-in.-> GTOKEN
  ROUTES -->|/usage| GAPI
  CTOKEN --> ROUTER
```

| Part | Where | Purpose |
| --- | --- | --- |
| Routes | `src/server.ts`, `src/routes/*` | One module per endpoint family |
| Guard | `src/lib/rate-limit.ts`, `src/lib/approval.ts` | `--rate-limit`, `--wait`, `--manual` |
| Router | `src/services/copilot/passthrough.ts` | `modelSupportsEndpoint`, `forwardToCopilot`, `unsupportedEndpointHint` |
| Translation | `src/routes/messages/*` | Anthropic to OpenAI and back (fallback only) |
| Model cache | `src/lib/utils.ts` (`cacheModels`), `src/services/copilot/get-models.ts` | Loaded at startup, used for routing |
| Tokens | `src/lib/token.ts`, `src/services/github/*` | Device sign-in, Copilot token exchange and refresh |
| Dashboard | `src/routes/dashboard.ts`, `src/routes/dashboard/*` | Static page; data from `/usage` and `/v1/models` |

## Authentication chain

```mermaid
sequenceDiagram
  autonumber
  participant U as You
  participant P as Proxy
  participant G as company.ghe.com
  participant A as api.company.ghe.com
  participant C as copilot-api.company.ghe.com

  U->>P: start (no github_token yet) or auth
  P->>G: POST /login/device/code (client_id Iv1.b507a08c87ecfe98)
  G-->>P: user_code + verification_uri
  P-->>U: "Enter code ABCD-1234 at /login/device"
  U->>G: approve in browser
  P->>G: poll /login/oauth/access_token
  G-->>P: GitHub token
  P->>P: save to ~/.local/share/copilot-api/github_token.<host>
  loop every refresh_in - 60 s
    P->>A: GET /copilot_internal/v2/token (Authorization: token ...)
    A-->>P: Copilot token + endpoints.api
  end
  U->>P: POST /v1/messages (any API key)
  P->>C: POST /v1/messages (Authorization: Bearer copilot token)
  C-->>P: response
  P-->>U: response
```

- The GitHub token is long-lived and stored in the token file (a mounted volume in Docker).
- The Copilot token is short-lived. `setupCopilotToken` refreshes it on a timer. The upstream base URL comes from the token response (`endpoints.api`), which is why it works for `*.ghe.com`.
- Clients never see either token. The proxy does **not** authenticate its own callers.

## Request flow: routing

```mermaid
flowchart TD
  R["Request<br/>POST /v1/... {model}"] --> Q{"Model supports<br/>this endpoint?"}
  Q -- yes --> P["Native passthrough<br/>forward body unchanged<br/>stream SSE straight back"]
  Q -- no --> M{"Is it /v1/messages?"}
  M -- yes --> T["Translate Anthropic to OpenAI chat<br/>call /chat/completions<br/>translate reply (and stream) back"]
  M -- no --> E["400 with a clear message<br/>names the supported endpoints"]
```

Details and the full model table are in [models-and-routing.md](models-and-routing.md).

## Request flow: Claude via /v1/messages

```mermaid
sequenceDiagram
  participant Cl as Claude Code / Desktop
  participant P as Proxy
  participant C as Copilot API
  Cl->>P: POST /v1/messages {model: claude-...}
  P->>P: rate limit, approval, supported_endpoints check
  P->>C: POST /v1/messages (body unchanged, anthropic-version / anthropic-beta forwarded)
  C-->>P: Anthropic message or SSE (adds copilot_usage)
  P-->>Cl: same bytes
```

## Request flow: non-Claude via /v1/messages (translated)

```mermaid
sequenceDiagram
  participant Cl as Anthropic client
  participant P as Proxy
  participant C as Copilot API
  Cl->>P: POST /v1/messages {model: gemini-...}
  P->>P: translateToOpenAI (messages, tools, system)
  P->>C: POST /chat/completions
  C-->>P: chat completion or chunks
  P->>P: translateToAnthropic / translateChunkToAnthropicEvents
  P-->>Cl: Anthropic message or SSE events
```

## Dashboard data flow

```mermaid
flowchart LR
  B[Browser /dashboard] -->|GET| S[static HTML + script]
  B -->|fetch| U["/usage"] --> GH["GitHub /copilot_internal/user"]
  B -->|fetch| MO["/v1/models"] --> Cache[(model cache)]
  B -->|Try it: fetch| API["/v1/... endpoints"] --> CAPI[Copilot API]
```

The page refreshes usage and models every 60 seconds. **Try it** sends real requests through the proxy and spends credits.
