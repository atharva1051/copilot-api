# Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `Model X does not support /chat/completions. Supported endpoints: /responses` | The model only supports another endpoint | Call the endpoint in the message (GPT-5/6, Grok: `/v1/responses`; Claude: `/v1/messages`) |
| `Model X does not support the Responses API` or upstream `unsupported_api_for_model` | Claude and other non-GPT models cannot use `/responses` | Use `/v1/messages` (Claude) or `/v1/chat/completions` |
| `no_available_model_endpoints` (400) | Model sent to an endpoint it does not serve upstream | Check `supported_endpoints` in `GET /v1/models` |
| `Model X does not support the Decisions API` | Only `gpt-6-luna` / `gpt-6-luna-decisions` support it | Use one of those |
| `model_not_supported` on `/v1/decisions` | Sent the OpenAI name straight upstream (older builds) | Use the proxy, which maps `gpt-6-luna`; or send `gpt-6-luna-decisions` |
| Plain `Bad Request` from `/v1/decisions` | Missing `questions` array | Add `questions` |
| `Bad Request` from `/v1/embeddings` | String `input` rejected upstream (older builds) | Update the proxy, or send `input` as an array |
| Empty `content` and `stop_reason: max_tokens` (Gemini and other reasoning models) | Hidden reasoning used the whole token budget | Raise `max_tokens` |
| 401 or "Failed to get Copilot token" at startup | GitHub token missing, expired or revoked | Run `auth` (Docker: `docker run -it ... copilot-api --auth`) |
| Device sign-in code is rejected or expired | Codes live about 15 minutes | Run `auth` again |
| 403 `Token endpoint is disabled` | `/token` is gated | Start with `--show-token` if you really need it |
| 429 from the proxy | `--rate-limit` is set | Wait, or start with `--wait` |
| `[Bun.serve]: request timed out after 10 seconds` and the client loses the reply | Older builds used Bun's 10s idle timeout while a reasoning model was still thinking | Update the proxy: it sets `idleTimeout` to 255s and sends `ping` / `: keepalive` on translated and chat streams |
| New model missing from the list | Model list is cached at startup | Restart the proxy |
| `/v1/messages` with Gemini returns empty text | Translation path with a reasoning model | Raise `max_tokens` |
| Claude Desktop model dropdown empty | Trailing slash or `/v1` in the gateway URL, or `/v1/models` unreachable | Use the bare origin; or add `inferenceModels` ([clients.md](clients.md)) |
| Claude Desktop will not connect to `http://localhost` | It may require HTTPS (unverified) | Put a TLS front in front of the proxy |
| Dashboard shows "Could not load data" | Proxy not reachable from the browser, or Copilot token failed | Check the proxy log; open `/usage` directly |
| Container starts but cannot authenticate | Empty or missing token file in the volume | Run the container with `--auth` and the same volume |

## Collecting diagnostics

```sh
node dist/main.js debug                     # environment and token file info
node dist/main.js start --verbose           # debug logging (logs request payloads)
curl http://localhost:4141/v1/models        # what the proxy believes is available
curl http://localhost:4141/usage            # quota and entitlement
docker logs <container>
```
