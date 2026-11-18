# Endpoints

Base URL: `http://localhost:4141` (or wherever the proxy runs). API key: any value. All inference routes are also mounted without the `/v1` prefix (for example `/chat/completions`). The machine-readable version is [openapi.yaml](openapi.yaml), served at `/openapi.yaml`.

| Method | Path | Purpose | Upstream |
| --- | --- | --- | --- |
| POST | `/v1/chat/completions` | OpenAI Chat Completions | `/chat/completions` |
| POST | `/v1/messages` | Anthropic Messages | `/v1/messages` (Claude) or translated to `/chat/completions` |
| POST | `/v1/messages/count_tokens` | Token estimate for an Anthropic request | local |
| POST | `/v1/responses` | OpenAI Responses | `/responses` |
| POST | `/v1/decisions` | OpenAI Decisions (typed answers) | `/v1/decisions` |
| POST | `/v1/embeddings` | Embeddings | `/embeddings` |
| GET | `/v1/models` | Model list with Copilot metadata | cached from `/models` |
| GET | `/usage` | Copilot quota and entitlement | GitHub `/copilot_internal/user` |
| GET | `/token` | Current Copilot token (403 unless `--show-token`) | local |
| GET | `/dashboard` | Web dashboard | local |
| GET | `/openapi.yaml` | OpenAPI description of the proxy | local |
| GET | `/` | Health check (`Server running`) | local |

## POST /v1/chat/completions

Standard OpenAI chat completions. Supports `stream: true`.

```sh
curl http://localhost:4141/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Say hi"}],"max_tokens":100}'
```

- If `max_tokens` is omitted, the proxy sets it from the model's `max_output_tokens`.
- A model that does not list `/chat/completions` in `supported_endpoints` gets a 400: `Model gpt-6-sol does not support /chat/completions. Supported endpoints: /responses`.
- Legacy Azure OpenAI models (`gpt-4o`, `gpt-4.1`, `gpt-4`, `gpt-3.5-turbo`) declare no endpoint list and work here.
- Reasoning models such as Gemini can spend the whole `max_tokens` on hidden reasoning and return empty content: raise `max_tokens`.

## POST /v1/messages

Anthropic Messages API.

```sh
curl http://localhost:4141/v1/messages \
  -H "Content-Type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model":"claude-haiku-5.5","max_tokens":100,"messages":[{"role":"user","content":"Say hi"}]}'
```

- **Claude models** (`supported_endpoints` includes `/v1/messages`): forwarded natively. Streaming, tool use and thinking pass through unchanged. The reply carries an extra `copilot_usage` block (token counts, cost per batch, `total_nano_aiu`). `anthropic-version` and `anthropic-beta` request headers are forwarded.
- **Other models** (Gemini, Kimi, Azure OpenAI): translated to chat completions and back, including streaming (`src/routes/messages/*`).
- `POST /v1/messages/count_tokens` returns `{"input_tokens": n}` from a local tokenizer estimate.

## POST /v1/responses

```sh
curl http://localhost:4141/v1/responses \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-5.4-nano","input":"Say hi","max_output_tokens":100}'
```

- Native passthrough for models that list `/responses` (GPT-5/6, Grok, Mai).
- Other models get a 400 `Model X does not support the Responses API`.
- `ws:/responses` (WebSocket) is not supported.

## POST /v1/decisions

The OpenAI [Decisions API](https://developers.openai.com/api/docs/guides/decisions): typed answers (`predicate`, `choice`, `score`) with no generated text, about 10x faster than the Responses API. Output tokens are not charged.

```sh
curl http://localhost:4141/v1/decisions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-6-luna",
    "input": "I was charged twice for my order.",
    "questions": [{
      "type": "choice",
      "name": "department",
      "instructions": "Which department should handle this complaint?",
      "choices": [
        {"value": "billing", "description": "Payments, invoices, and refunds."},
        {"value": "shipping", "description": "Delivery and tracking."}
      ]
    }]
  }'
```

- The Copilot model id is `gpt-6-luna-decisions`. The proxy maps `gpt-6-luna` to it, so OpenAI SDK code works unchanged. Sending `gpt-6-luna` straight to the upstream returns `model_not_supported`.
- `questions` is required. Without it the upstream returns a plain-text `Bad Request`.
- Verified on the live instance: text input with `choice`, `predicate` and `score`. Not tested: image input, JSON input, conversation history, prompt caching, 400 questions.

## POST /v1/embeddings

```sh
curl http://localhost:4141/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{"model":"text-embedding-3-small","input":["hello world"]}'
```

- Models: `text-embedding-3-small`, `text-embedding-3-small-inference`, `text-embedding-ada-002` (1536 dimensions for 3-small).
- The upstream accepts `input` only as an array. A string is wrapped into an array by the proxy (`src/services/copilot/create-embeddings.ts`).

## GET /v1/models

OpenAI-style list, extended with Copilot metadata:

```json
{
  "id": "claude-opus-5.5",
  "object": "model",
  "owned_by": "Anthropic",
  "display_name": "Claude Opus 5.5",
  "supported_endpoints": ["/v1/messages", "/chat/completions"],
  "capability_type": "chat",
  "capabilities": { "family": "...", "limits": { "max_context_window_tokens": 0 }, "supports": {} }
}
```

`supported_endpoints` drives routing (see [models-and-routing.md](models-and-routing.md)). It is absent for legacy Azure OpenAI models.

## GET /usage

Returns GitHub's `/copilot_internal/user` payload for the signed-in user: plan, SKU, enabled features and `quota_snapshots` (`premium_interactions`: `entitlement`, `remaining`, `credits_used`, `overage_permitted`) plus `quota_reset_date_utc`.

## GET /token

Returns `{"token": "<copilot token>"}` only when the server was started with `--show-token`; otherwise 403. Treat the token like a password.

## Common behavior

- **Rate limit**: `--rate-limit <seconds>` rejects (429) or, with `--wait`, delays requests that arrive too fast.
- **Manual approval**: `--manual` prompts in the terminal before each inference request.
- **Errors**: upstream HTTP errors are forwarded with the upstream status. Proxy-side errors use `{"error":{"message","type"}}`.
- **X-Initiator**: passthrough routes send `X-Initiator: agent` when the conversation contains assistant, tool or tool-result turns, otherwise `user`.
