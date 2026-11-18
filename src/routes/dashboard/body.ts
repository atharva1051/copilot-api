const architectureDiagram = `
<svg viewBox="0 0 920 400" role="img" aria-label="Architecture: clients call the proxy, which authenticates with GitHub and forwards to the Copilot API">
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#57606a"/></marker>
  </defs>

  <rect x="10" y="40" width="190" height="320" rx="10" fill="#f6f8fa" stroke="#d0d7de"/>
  <text x="105" y="62" text-anchor="middle" class="t-bold">Clients</text>
  <rect x="26" y="80" width="158" height="46" rx="6" fill="#fff" stroke="#d0d7de"/><text x="105" y="100" text-anchor="middle">Claude Code</text><text x="105" y="115" text-anchor="middle" class="t-small">Anthropic Messages</text>
  <rect x="26" y="138" width="158" height="46" rx="6" fill="#fff" stroke="#d0d7de"/><text x="105" y="158" text-anchor="middle">Claude Desktop</text><text x="105" y="173" text-anchor="middle" class="t-small">Anthropic Messages</text>
  <rect x="26" y="196" width="158" height="46" rx="6" fill="#fff" stroke="#d0d7de"/><text x="105" y="216" text-anchor="middle">OpenAI SDKs / Cursor</text><text x="105" y="231" text-anchor="middle" class="t-small">Chat, Responses, Embeddings</text>
  <rect x="26" y="254" width="158" height="46" rx="6" fill="#fff" stroke="#d0d7de"/><text x="105" y="274" text-anchor="middle">curl / scripts</text><text x="105" y="289" text-anchor="middle" class="t-small">any of the endpoints</text>
  <rect x="26" y="312" width="158" height="38" rx="6" fill="#fff" stroke="#d0d7de"/><text x="105" y="335" text-anchor="middle">Browser dashboard</text>

  <rect x="290" y="20" width="340" height="360" rx="10" fill="#ddf4ff" stroke="#54aeff"/>
  <text x="460" y="44" text-anchor="middle" class="t-bold">copilot-api-ghe proxy (this server, port 4141)</text>
  <rect x="310" y="60" width="300" height="34" rx="6" fill="#fff" stroke="#b6e3ff"/><text x="460" y="82" text-anchor="middle">Hono routes  /v1/*  /dashboard  /usage</text>
  <rect x="310" y="106" width="300" height="34" rx="6" fill="#fff" stroke="#b6e3ff"/><text x="460" y="128" text-anchor="middle">Rate limit  &#183;  manual approval (optional)</text>
  <rect x="310" y="152" width="300" height="58" rx="6" fill="#fff" stroke="#b6e3ff"/><text x="460" y="172" text-anchor="middle">Router: model.supported_endpoints</text><text x="460" y="190" text-anchor="middle" class="t-small">native passthrough  or  Anthropic&#8594;OpenAI translation</text>
  <rect x="310" y="222" width="300" height="34" rx="6" fill="#fff" stroke="#b6e3ff"/><text x="460" y="244" text-anchor="middle">Model cache  (GET /models at startup)</text>
  <rect x="310" y="268" width="300" height="34" rx="6" fill="#fff" stroke="#b6e3ff"/><text x="460" y="290" text-anchor="middle">Copilot token (auto-refresh)</text>
  <rect x="310" y="314" width="300" height="52" rx="6" fill="#fff" stroke="#b6e3ff"/><text x="460" y="334" text-anchor="middle">GitHub token file</text><text x="460" y="352" text-anchor="middle" class="t-small">~/.local/share/copilot-api/github_token</text>

  <rect x="720" y="20" width="190" height="150" rx="10" fill="#f6f8fa" stroke="#d0d7de"/>
  <text x="815" y="44" text-anchor="middle" class="t-bold">GitHub (GHE)</text>
  <text x="815" y="66" text-anchor="middle">api.company.ghe.com</text>
  <text x="815" y="90" text-anchor="middle" class="t-small">/copilot_internal/v2/token</text>
  <text x="815" y="106" text-anchor="middle" class="t-small">/copilot_internal/user (quota)</text>
  <text x="815" y="130" text-anchor="middle">company.ghe.com</text>
  <text x="815" y="146" text-anchor="middle" class="t-small">/login/device (sign-in)</text>

  <rect x="720" y="210" width="190" height="170" rx="10" fill="#dafbe1" stroke="#4ac26b"/>
  <text x="815" y="234" text-anchor="middle" class="t-bold">Copilot API (CAPI)</text>
  <text x="815" y="252" text-anchor="middle">copilot-api.company.ghe.com</text>
  <text x="815" y="280" text-anchor="middle" class="t-small">/v1/messages  (Claude)</text>
  <text x="815" y="296" text-anchor="middle" class="t-small">/responses  (GPT, Grok, Mai)</text>
  <text x="815" y="312" text-anchor="middle" class="t-small">/chat/completions  (Gemini, Kimi, Azure)</text>
  <text x="815" y="328" text-anchor="middle" class="t-small">/v1/decisions  /embeddings  /models</text>

  <line x1="200" y1="110" x2="288" y2="110" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="200" y1="168" x2="288" y2="168" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="200" y1="226" x2="288" y2="226" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="200" y1="284" x2="288" y2="284" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="200" y1="331" x2="288" y2="331" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr)"/>
  <line x1="630" y1="281" x2="718" y2="281" stroke="#1a7f37" stroke-width="2" marker-end="url(#arr)"/>
  <text x="674" y="272" text-anchor="middle" class="t-small">Bearer</text>
  <line x1="630" y1="100" x2="718" y2="100" stroke="#57606a" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#arr)"/>
  <text x="674" y="92" text-anchor="middle" class="t-small">token / usage</text>
</svg>`

const routingDiagram = `
<svg viewBox="0 0 920 330" role="img" aria-label="Routing decision for an incoming request">
  <defs>
    <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#57606a"/></marker>
  </defs>
  <rect x="10" y="130" width="150" height="56" rx="8" fill="#f6f8fa" stroke="#d0d7de"/>
  <text x="85" y="154" text-anchor="middle" class="t-bold">Request</text><text x="85" y="171" text-anchor="middle" class="t-small">POST /v1/&#8230; {model}</text>

  <polygon points="290,100 410,158 290,216 170,158" fill="#fff8c5" stroke="#eac54f"/>
  <text x="290" y="154" text-anchor="middle">Does the model</text><text x="290" y="170" text-anchor="middle">support this endpoint?</text>

  <rect x="470" y="20" width="200" height="62" rx="8" fill="#dafbe1" stroke="#4ac26b"/>
  <text x="570" y="44" text-anchor="middle" class="t-bold">Yes: native passthrough</text><text x="570" y="62" text-anchor="middle" class="t-small">forward body unchanged,</text><text x="570" y="75" text-anchor="middle" class="t-small">stream SSE straight back</text>

  <polygon points="570,120 690,170 570,220 450,170" fill="#fff8c5" stroke="#eac54f"/>
  <text x="570" y="166" text-anchor="middle">No: is it</text><text x="570" y="182" text-anchor="middle">/v1/messages?</text>

  <rect x="740" y="120" width="170" height="100" rx="8" fill="#ddf4ff" stroke="#54aeff"/>
  <text x="825" y="144" text-anchor="middle" class="t-bold">Yes: translate</text><text x="825" y="162" text-anchor="middle" class="t-small">Anthropic &#8594; OpenAI chat,</text><text x="825" y="176" text-anchor="middle" class="t-small">call /chat/completions,</text><text x="825" y="190" text-anchor="middle" class="t-small">translate reply back</text><text x="825" y="208" text-anchor="middle" class="t-small">(Gemini, Kimi, Azure)</text>

  <rect x="470" y="260" width="440" height="56" rx="8" fill="#ffebe9" stroke="#ff8182"/>
  <text x="690" y="284" text-anchor="middle" class="t-bold">No: 400 with a clear message</text><text x="690" y="302" text-anchor="middle" class="t-small">e.g. "Model X does not support /chat/completions. Supported endpoints: /responses"</text>

  <line x1="160" y1="158" x2="168" y2="158" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr2)"/>
  <line x1="350" y1="130" x2="468" y2="60" stroke="#1a7f37" stroke-width="1.5" marker-end="url(#arr2)"/>
  <line x1="410" y1="158" x2="448" y2="168" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr2)"/>
  <text x="418" y="104" class="t-small">yes</text>
  <text x="424" y="150" class="t-small">no</text>
  <line x1="690" y1="170" x2="738" y2="170" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr2)"/>
  <text x="708" y="162" class="t-small">yes</text>
  <line x1="570" y1="220" x2="620" y2="258" stroke="#cf222e" stroke-width="1.5" marker-end="url(#arr2)"/>
  <text x="604" y="238" class="t-small">no</text>
</svg>`

const authDiagram = `
<svg viewBox="0 0 920 230" role="img" aria-label="Authentication chain">
  <defs>
    <marker id="arr3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#57606a"/></marker>
  </defs>
  <rect x="10" y="20" width="200" height="90" rx="8" fill="#f6f8fa" stroke="#d0d7de"/>
  <text x="110" y="44" text-anchor="middle" class="t-bold">1. Device sign-in</text><text x="110" y="64" text-anchor="middle" class="t-small">auth / first start</text><text x="110" y="80" text-anchor="middle" class="t-small">company.ghe.com/login/device</text><text x="110" y="96" text-anchor="middle" class="t-small">client_id Iv1.b507a08c87ecfe98</text>
  <rect x="250" y="20" width="200" height="90" rx="8" fill="#f6f8fa" stroke="#d0d7de"/>
  <text x="350" y="44" text-anchor="middle" class="t-bold">2. GitHub token</text><text x="350" y="64" text-anchor="middle" class="t-small">saved to github_token</text><text x="350" y="80" text-anchor="middle" class="t-small">(mounted volume in Docker)</text>
  <rect x="490" y="20" width="200" height="90" rx="8" fill="#f6f8fa" stroke="#d0d7de"/>
  <text x="590" y="44" text-anchor="middle" class="t-bold">3. Copilot token</text><text x="590" y="64" text-anchor="middle" class="t-small">GET /copilot_internal/v2/token</text><text x="590" y="80" text-anchor="middle" class="t-small">short-lived, refreshed</text><text x="590" y="96" text-anchor="middle" class="t-small">before refresh_in expires</text>
  <rect x="730" y="20" width="180" height="90" rx="8" fill="#dafbe1" stroke="#4ac26b"/>
  <text x="820" y="44" text-anchor="middle" class="t-bold">4. Copilot API calls</text><text x="820" y="64" text-anchor="middle" class="t-small">Authorization: Bearer</text><text x="820" y="80" text-anchor="middle" class="t-small">+ editor / integration</text><text x="820" y="96" text-anchor="middle" class="t-small">headers</text>
  <line x1="210" y1="65" x2="248" y2="65" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr3)"/>
  <line x1="450" y1="65" x2="488" y2="65" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr3)"/>
  <line x1="690" y1="65" x2="728" y2="65" stroke="#57606a" stroke-width="1.5" marker-end="url(#arr3)"/>
  <rect x="10" y="140" width="900" height="70" rx="8" fill="#fff8c5" stroke="#eac54f"/>
  <text x="460" y="166" text-anchor="middle" class="t-bold">Clients never see these tokens.</text>
  <text x="460" y="186" text-anchor="middle" class="t-small">Clients talk to the proxy with any dummy API key. The proxy itself has no login: anyone who can reach the port can use your Copilot quota.</text>
</svg>`

export const dashboardBody = `
  <div class="container">
    <header class="app-header">
      <div class="app-title">
        <h1>Copilot API</h1>
        <p>OpenAI and Anthropic compatible proxy for GitHub Copilot (company.ghe.com)</p>
        <span class="status-pill" id="status-pill"><span class="dot"></span><span id="status-text">Connecting</span></span>
      </div>
      <div class="base-url"><span class="label">Base URL</span><code id="base-url"></code><button class="copy-btn" style="position:static" data-copy-target="base-url">Copy</button></div>
    </header>

    <div class="tabs" role="tablist" aria-label="Dashboard sections">
      <button class="tab" role="tab" id="tab-btn-overview" data-tab="overview" aria-selected="true" aria-controls="panel-overview">Overview</button>
      <button class="tab" role="tab" id="tab-btn-models" data-tab="models" aria-selected="false" aria-controls="panel-models">Models</button>
      <button class="tab" role="tab" id="tab-btn-api" data-tab="api" aria-selected="false" aria-controls="panel-api">API Reference</button>
      <button class="tab" role="tab" id="tab-btn-connect" data-tab="connect" aria-selected="false" aria-controls="panel-connect">Connect Clients</button>
      <button class="tab" role="tab" id="tab-btn-docs" data-tab="docs" aria-selected="false" aria-controls="panel-docs">Docs &amp; Troubleshooting</button>
    </div>

    <section class="panel active" id="panel-overview" role="tabpanel" aria-labelledby="tab-btn-overview"><div class="loading"><div class="spinner"></div></div></section>
    <section class="panel" id="panel-models" role="tabpanel" aria-labelledby="tab-btn-models"><div class="loading"><div class="spinner"></div></div></section>
    <section class="panel" id="panel-api" role="tabpanel" aria-labelledby="tab-btn-api"><div class="loading"><div class="spinner"></div></div></section>
    <section class="panel" id="panel-connect" role="tabpanel" aria-labelledby="tab-btn-connect"><div class="loading"><div class="spinner"></div></div></section>

    <section class="panel" id="panel-docs" role="tabpanel" aria-labelledby="tab-btn-docs">
      <div class="docs-nav">
        <a href="#docs-how">How it works</a><a href="#docs-auth">Authentication</a><a href="#docs-routing">Routing rules</a><a href="#docs-quirks">Endpoint quirks</a><a href="#docs-errors">Troubleshooting</a><a href="#docs-limits">Limitations &amp; security</a><a href="#docs-more">More documentation</a>
      </div>

      <h2 class="section" id="docs-how">How it works</h2>
      <p class="lead">The proxy makes GitHub Copilot look like a normal OpenAI or Anthropic API. Your tool sends a standard request to this server, which signs in to GitHub, picks the right Copilot endpoint for the requested model, and returns the answer in the format your tool expects.</p>
      <div class="diagram">${architectureDiagram}</div>

      <h2 class="section" id="docs-auth">Authentication</h2>
      <p class="lead">Two tokens are involved. You sign in once with GitHub's device flow; the proxy then exchanges that long-lived token for short-lived Copilot tokens and refreshes them automatically.</p>
      <div class="diagram">${authDiagram}</div>

      <h2 class="section" id="docs-routing">Routing rules</h2>
      <p class="lead">Every model in <code>GET /v1/models</code> lists the Copilot endpoints it supports (<code>supported_endpoints</code>). The proxy uses that list to decide what to do with each request.</p>
      <div class="diagram">${routingDiagram}</div>
      <table class="tbl" style="margin-top:16px">
        <thead><tr><th>Model family</th><th>Copilot endpoint</th><th>Proxy endpoints that work</th></tr></thead>
        <tbody>
          <tr><td>Claude (Anthropic)</td><td class="mono">/v1/messages</td><td class="mono">/v1/messages (native), /v1/chat/completions</td></tr>
          <tr><td>GPT-5 / GPT-6, Grok, Mai</td><td class="mono">/responses</td><td class="mono">/v1/responses (native)</td></tr>
          <tr><td>Gemini, Kimi</td><td class="mono">/chat/completions</td><td class="mono">/v1/chat/completions, /v1/messages (translated)</td></tr>
          <tr><td>Azure OpenAI (gpt-4o, gpt-4.1, gpt-4, gpt-3.5)</td><td class="mono">/chat/completions (not declared; inferred from capability type)</td><td class="mono">/v1/chat/completions, /v1/messages (translated)</td></tr>
          <tr><td>gpt-6-luna-decisions</td><td class="mono">/v1/decisions</td><td class="mono">/v1/decisions</td></tr>
          <tr><td>text-embedding-*</td><td class="mono">/embeddings</td><td class="mono">/v1/embeddings</td></tr>
        </tbody>
      </table>

      <h2 class="section" id="docs-quirks">Endpoint quirks</h2>
      <table class="tbl">
        <thead><tr><th>Endpoint</th><th>Behavior to know about</th></tr></thead>
        <tbody>
          <tr><td class="mono">/v1/messages</td><td>Claude models are forwarded natively, including streaming, tool use and the <code>copilot_usage</code> block. Other models are translated to chat completions and back. <code>anthropic-version</code> and <code>anthropic-beta</code> headers are forwarded.</td></tr>
          <tr><td class="mono">/v1/responses</td><td>Native passthrough only. Models without <code>/responses</code> support get a 400 from the proxy. WebSocket <code>/responses</code> is not supported.</td></tr>
          <tr><td class="mono">/v1/chat/completions</td><td>Returns a 400 naming the right endpoint when the model does not support it (for example GPT-6 models only support <code>/responses</code>).</td></tr>
          <tr><td class="mono">/v1/decisions</td><td>Requires a <code>questions</code> array. The OpenAI model name <code>gpt-6-luna</code> is mapped to the Copilot id <code>gpt-6-luna-decisions</code>. Output tokens are not charged.</td></tr>
          <tr><td class="mono">/v1/embeddings</td><td>The upstream only accepts <code>input</code> as an array. A string is wrapped into an array by the proxy.</td></tr>
          <tr><td class="mono">/token</td><td>Disabled (403) unless the server was started with <code>--show-token</code>.</td></tr>
          <tr><td class="mono">/openapi.yaml</td><td>OpenAPI description of this proxy's own API.</td></tr>
        </tbody>
      </table>

      <h2 class="section" id="docs-errors">Troubleshooting</h2>
      <table class="tbl">
        <thead><tr><th>Symptom</th><th>Likely cause</th><th>What to do</th></tr></thead>
        <tbody>
          <tr><td><code>does not support /chat/completions</code></td><td>The model only supports <code>/responses</code> or <code>/v1/messages</code>.</td><td>Call the endpoint named in the error message (see the Models tab).</td></tr>
          <tr><td><code>unsupported_api_for_model</code> or <code>does not support the Responses API</code></td><td>Claude and other non-GPT models cannot use <code>/responses</code>.</td><td>Use <code>/v1/messages</code> for Claude.</td></tr>
          <tr><td><code>no_available_model_endpoints</code></td><td>Model sent to an endpoint it does not serve (for example GPT on <code>/v1/messages</code> upstream).</td><td>Check <code>supported_endpoints</code> for the model.</td></tr>
          <tr><td><code>model_not_supported</code> on decisions</td><td>The upstream wants the Copilot id.</td><td>Use <code>gpt-6-luna</code> (mapped) or <code>gpt-6-luna-decisions</code>.</td></tr>
          <tr><td>Plain "Bad Request" from decisions</td><td>Missing <code>questions</code> array.</td><td>See the decisions sample in API Reference.</td></tr>
          <tr><td>"Bad Request" from embeddings (older builds)</td><td>String <code>input</code> rejected upstream.</td><td>Update the proxy; or send <code>input</code> as an array.</td></tr>
          <tr><td>Empty text and <code>stop_reason: max_tokens</code> (Gemini)</td><td>Hidden reasoning used the whole token budget.</td><td>Raise <code>max_tokens</code>.</td></tr>
          <tr><td>401 or "Failed to get Copilot token"</td><td>GitHub token missing, expired or revoked.</td><td>Re-run <code>auth</code> (Docker: <code>docker run -it ... copilot-api --auth</code>).</td></tr>
          <tr><td>403 from <code>/token</code></td><td>Token endpoint is intentionally disabled.</td><td>Start with <code>--show-token</code> only if you really need it.</td></tr>
          <tr><td>Claude Desktop model list is empty</td><td>Trailing slash or <code>/v1</code> in the gateway URL, or <code>/v1/models</code> unreachable.</td><td>Use the bare origin; or add <code>inferenceModels</code> (Connect Clients tab).</td></tr>
          <tr><td>Claude Desktop will not connect</td><td>It may require HTTPS for the gateway.</td><td>Put a TLS front (tunnel or reverse proxy) in front of the proxy.</td></tr>
          <tr><td>429 from the proxy</td><td>Rate limit configured with <code>--rate-limit</code>.</td><td>Wait, or start with <code>--wait</code>.</td></tr>
        </tbody>
      </table>

      <h2 class="section" id="docs-limits">Limitations &amp; security</h2>
      <div class="callout danger"><b>No authentication on the proxy.</b> Any API key is accepted. Anyone who can reach this port can spend your Copilot credits. Bind it to localhost or put it behind a network control. Do not expose it publicly.</div>
      <div class="callout warn"><b>Try it spends credits.</b> The Send buttons in the API Reference tab make real requests through this proxy. The sample payloads are tiny.</div>
      <ul style="font-size:13px;color:var(--fg-muted);padding-left:20px;max-width:760px">
        <li>Undocumented upstream: the Copilot endpoints are discovered from VS Code's bundled extension and may change without notice.</li>
        <li>Claude Cowork, Remote Control and claude.ai in the browser are not covered by the Claude Desktop gateway mode.</li>
        <li>WebSocket <code>/responses</code> and image or JSON input for decisions are not tested.</li>
      </ul>

      <h2 class="section" id="docs-more">More documentation</h2>
      <ul style="font-size:13px;padding-left:20px;line-height:1.9">
        <li><a href="/openapi.yaml" target="_blank" rel="noopener">/openapi.yaml</a> &mdash; OpenAPI description of this proxy</li>
        <li>Repository <code>docs/</code> folder: architecture, endpoints, models and routing, clients, operations, troubleshooting and the upstream Copilot API spec</li>
        <li><a href="https://code.claude.com/docs/en/llm-gateway-connect" target="_blank" rel="noopener">Anthropic: connect Claude Code to an LLM gateway</a></li>
        <li><a href="https://docs.qcode.cc/en/docs/ide/claude-desktop" target="_blank" rel="noopener">Claude Desktop third-party gateway guide</a></li>
        <li><a href="https://developers.openai.com/api/docs/guides/decisions" target="_blank" rel="noopener">OpenAI Decisions API guide</a></li>
      </ul>
    </section>
  </div>
`
