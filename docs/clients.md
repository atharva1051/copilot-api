# Connecting clients

Replace `http://localhost:4141` with your proxy URL. The API key is never checked: use `dummy`. The dashboard **Connect Clients** tab generates these snippets with your real URL and the newest Claude models on your account.

## Claude Code

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:4141",
    "ANTHROPIC_AUTH_TOKEN": "dummy",
    "ANTHROPIC_MODEL": "claude-opus-5.5",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "claude-sonnet-5.5",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "claude-opus-5.5",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "claude-haiku-5.5",
    "DISABLE_NON_ESSENTIAL_MODEL_CALLS": "1",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  },
  "permissions": { "deny": ["WebSearch"] }
}
```

Put it in `.claude/settings.json`. Or run `node dist/main.js start --claude-code` to pick models interactively and copy a ready-to-run command.

## Claude Desktop

Claude Desktop can use the proxy as a third-party inference gateway without signing in to Anthropic.

1. Launch Claude Desktop and **do not sign in**. If the menu button does not respond, click the email field, press Tab, then Enter.
2. **Menu > Help > Troubleshooting > Enable Developer Mode**.
3. **Menu > Developer > Configure Third-Party Inference...** and choose **Gateway** (Anthropic-compatible).
4. Fill in the fields, then **Apply locally**.

| Field | Value |
| --- | --- |
| Gateway base URL | `http://localhost:4141` (no trailing `/`, no `/v1`) |
| Gateway API key | `dummy` |
| Gateway auth scheme | `bearer` (default) |
| Gateway extra headers | empty |

Desktop appends `/v1/messages` and `/v1/models` itself. If the model dropdown stays empty, use **Export > Open in file manager**, add the model list to the JSON config and fully restart the app:

```json
{
  "inferenceProvider": "gateway",
  "inferenceGatewayBaseUrl": "http://localhost:4141",
  "inferenceGatewayApiKey": "dummy",
  "inferenceModels": ["claude-opus-5.5", "claude-sonnet-5.5", "claude-haiku-5.5"]
}
```

Limits and caveats:

- Gateway mode runs **local sessions only**. Claude Cowork and Remote Control are not covered; claude.ai in the browser is unaffected.
- `/v1/models` returns every Copilot model, including GPT and Gemini. Desktop speaks the Anthropic protocol, so use the Claude models (the `inferenceModels` list above restricts the dropdown).
- **Unverified**: Desktop may require HTTPS for the gateway. If it refuses a plain `http://localhost` URL, put a TLS front (tunnel or reverse proxy) in front of the proxy.
- References: [Anthropic gateway docs](https://code.claude.com/docs/en/llm-gateway-connect), [third-party setup guide](https://docs.qcode.cc/en/docs/ide/claude-desktop).

## OpenAI SDKs and tools

Cursor, Continue, Aider, LangChain and others only need the base URL and a key:

```sh
export OPENAI_BASE_URL=http://localhost:4141/v1
export OPENAI_API_KEY=dummy
export ANTHROPIC_BASE_URL=http://localhost:4141
export ANTHROPIC_AUTH_TOKEN=dummy
```

Python (chat completions):

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:4141/v1", api_key="dummy")
reply = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello"}],
)
print(reply.choices[0].message.content)
```

JavaScript (responses, for GPT-5/6):

```js
import OpenAI from "openai";

const client = new OpenAI({ baseURL: "http://localhost:4141/v1", apiKey: "dummy" });
const reply = await client.responses.create({ model: "gpt-5.4-nano", input: "Hello" });
console.log(reply.output_text);
```

Python (Anthropic SDK):

```python
from anthropic import Anthropic

client = Anthropic(base_url="http://localhost:4141", api_key="dummy")
reply = client.messages.create(
    model="claude-haiku-5.5",
    max_tokens=100,
    messages=[{"role": "user", "content": "Hello"}],
)
print(reply.content[0].text)
```

Pick the endpoint by model family: Claude on `/v1/messages`, GPT-5/6 and Grok on `/v1/responses`, everything else on `/v1/chat/completions`. See [models-and-routing.md](models-and-routing.md).
