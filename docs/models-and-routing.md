# Models and routing

## Where the model list comes from

At startup the proxy calls the Copilot API `GET /models` and caches the result in memory (`state.models`). `GET /v1/models` returns it in OpenAI format plus extra fields. Restart the proxy to pick up newly enabled models.

Each Copilot model has a `supported_endpoints` array. That array decides where requests for the model can go.

## Routing rule

For each request the proxy checks `modelSupportsEndpoint(model, endpoint)` (`src/services/copilot/passthrough.ts`):

1. **Supported**: forward the body unchanged to the same endpoint upstream (native passthrough). SSE streams are piped straight back.
2. **Not supported and the route is `/v1/messages`**: translate Anthropic to OpenAI chat completions, call `/chat/completions`, translate the reply back.
3. **Not supported otherwise**: return 400 with a message that names the supported endpoints.

If the model list is not loaded, or a model declares no endpoints (legacy Azure OpenAI), the proxy does not block the request and lets the upstream decide.

## Model families (verified 2026-11-10 on company.ghe.com)

| Family | Examples | `supported_endpoints` | Call on the proxy |
| --- | --- | --- | --- |
| Claude | `claude-opus-5.5`, `claude-sonnet-5.5`, `claude-haiku-5.5`, `claude-haiku-4.5`, `claude-opus-4.8` | `/v1/messages`, `/chat/completions` | `/v1/messages` (native). `/v1/chat/completions` also works |
| GPT-5 / GPT-6 | `gpt-5.4-nano`, `gpt-6-sol`, `gpt-6-luna`, `gpt-6.1-terra` | `/responses`, `ws:/responses` | `/v1/responses` |
| Grok, Mai | `grok-4.7`, `mai-code-1.1-flash` | `/responses` (Mai also `ws:/responses`) | `/v1/responses` |
| Gemini, Kimi | `gemini-3.8-flash`, `gemini-4-argon`, `kimi-k3` | `/chat/completions` | `/v1/chat/completions`; `/v1/messages` is translated |
| Azure OpenAI chat | `gpt-4o`, `gpt-4o-mini`, `gpt-4.1`, `gpt-4`, `gpt-3.5-turbo` (and dated variants) | not declared (capability type `chat`) | `/v1/chat/completions`; `/v1/messages` is translated |
| Embeddings | `text-embedding-3-small`, `-inference`, `text-embedding-ada-002` | not declared (capability type `embeddings`) | `/v1/embeddings` |
| Decisions | `gpt-6-luna-decisions` | `/v1/decisions` | `/v1/decisions` (`gpt-6-luna` is mapped) |
| Code completion | `gpt-41-copilot` | not declared (capability type `completion`) | not callable through the proxy |

The list changes as Copilot rolls out models; always check `GET /v1/models` or the dashboard **Models** tab.

## How the dashboard groups models

Each model appears once, under its highest-priority endpoint: `/v1/messages`, then `/responses`, then `/chat/completions`, then `/v1/decisions`, then `/embeddings`. Models without a declared list are grouped by capability type (`chat` to `/chat/completions`, `embeddings` to `/embeddings`); anything else lands in **Other models**. Hover or click a model to see the other endpoints it supports.

## Special cases

- **Decisions**: `gpt-6-luna` is rewritten to `gpt-6-luna-decisions` (`src/routes/decisions/handler.ts`, `resolveDecisionsModel`).
- **Embeddings**: string `input` becomes `[input]`.
- **max_tokens**: chat completions fill in the model's `max_output_tokens` when omitted.
- **Billing**: Copilot uses token-based billing. Native Claude and Responses replies include a `copilot_usage` block with exact tokens and `total_nano_aiu`.
