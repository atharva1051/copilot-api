export const dashboardScript = `
(function () {
  var baseUrl = window.location.origin;
  var NL = String.fromCharCode(10);
  var BS = String.fromCharCode(92);
  var SQ = String.fromCharCode(39);
  var DQ = String.fromCharCode(34);
  var TABS = ['overview', 'models', 'api', 'connect', 'docs'];
  var data = { usage: null, models: null };
  var samples = [];
  var selectedModelId = null;
  var filter = { q: '', vendor: '', endpoint: '' };

  var ENDPOINTS = [
    { key: '/v1/messages', desc: 'Anthropic Messages API (native passthrough)' },
    { key: '/responses', desc: 'OpenAI Responses API (native passthrough)' },
    { key: '/chat/completions', desc: 'OpenAI Chat Completions API' },
    { key: '/v1/decisions', desc: 'OpenAI Decisions API: predicate / choice / score answers, no text output' },
    { key: '/embeddings', desc: 'OpenAI Embeddings API (input must be an array; the proxy wraps strings)' }
  ];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function num(n) { return (n || 0).toLocaleString(); }

  function codeBlock(text) {
    return '<div class="code-block has-copy"><button class="copy-btn" type="button">Copy</button><span class="code-text">' + esc(text) + '</span></div>';
  }

  /* ------------------------------------------------------------ tabs */
  function showTab(name) {
    if (TABS.indexOf(name) === -1) name = 'overview';
    TABS.forEach(function (t) {
      $('panel-' + t).classList.toggle('active', t === name);
      var b = $('tab-btn-' + t);
      b.setAttribute('aria-selected', t === name ? 'true' : 'false');
      b.tabIndex = t === name ? 0 : -1;
    });
  }

  function route() {
    var h = window.location.hash.replace('#', '');
    if (h.indexOf('docs-') === 0) {
      showTab('docs');
      var target = $(h);
      if (target) target.scrollIntoView();
      return;
    }
    showTab(h);
  }

  function setStatus(kind, text) {
    $('status-pill').className = 'status-pill' + (kind ? ' ' + kind : '');
    $('status-text').textContent = text;
  }

  /* ----------------------------------------------------------- models */
  function usableEndpoints(m) {
    return (m.supported_endpoints || []).filter(function (e) { return e.indexOf('ws:') !== 0; });
  }

  function primaryEndpoint(m) {
    var eps = usableEndpoints(m);
    for (var i = 0; i < ENDPOINTS.length; i++) {
      if (eps.indexOf(ENDPOINTS[i].key) !== -1) return ENDPOINTS[i].key;
    }
    if (eps.length) return eps[0];
    if (m.capability_type === 'chat') return '/chat/completions';
    if (m.capability_type === 'embeddings') return '/embeddings';
    return '';
  }

  function modelsData() { return data.models && data.models.data ? data.models.data : []; }

  function pickModel(endpoint, prefs, fallback) {
    var ids = modelsData().filter(function (m) { return primaryEndpoint(m) === endpoint; }).map(function (m) { return m.id; });
    for (var i = 0; i < prefs.length; i++) {
      if (ids.indexOf(prefs[i]) !== -1) return prefs[i];
    }
    return ids.length ? ids[0] : fallback;
  }

  function versionParts(id) {
    return id.split('-').slice(2).join('-').split('.').map(function (n) { return parseInt(n, 10) || 0; });
  }

  function compareVersions(a, b) {
    for (var i = 0; i < Math.max(a.length, b.length); i++) {
      var d = (a[i] || 0) - (b[i] || 0);
      if (d !== 0) return d;
    }
    return 0;
  }

  function latestClaude(family, fallback) {
    var best = null;
    modelsData().forEach(function (m) {
      if (m.id.indexOf('claude-' + family + '-') !== 0) return;
      if (usableEndpoints(m).indexOf('/v1/messages') === -1) return;
      if (!/^[0-9]/.test(m.id.split('-')[2] || '')) return;
      var v = versionParts(m.id);
      if (!best || compareVersions(v, best.v) > 0) best = { id: m.id, v: v };
    });
    return best ? best.id : fallback;
  }

  function renderModelGroups() {
    var q = filter.q.toLowerCase();
    var list = modelsData().filter(function (m) {
      if (filter.vendor && m.owned_by !== filter.vendor) return false;
      if (filter.endpoint && primaryEndpoint(m) !== filter.endpoint) return false;
      if (q && (m.id + ' ' + (m.display_name || '') + ' ' + (m.owned_by || '')).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    if (!list.length) return '<div class="empty">No models match the current filters.</div>';

    var groups = {};
    list.forEach(function (m) {
      var key = primaryEndpoint(m);
      (groups[key] = groups[key] || []).push(m);
    });
    var known = ENDPOINTS.map(function (e) { return e.key; });
    var keys = known.filter(function (k) { return groups[k]; })
      .concat(Object.keys(groups).filter(function (k) { return k && known.indexOf(k) === -1; }))
      .concat(groups[''] ? [''] : []);

    var out = '';
    keys.forEach(function (key) {
      var items = groups[key].slice().sort(function (a, b) { return a.id.localeCompare(b.id); });
      var meta = ENDPOINTS.filter(function (e) { return e.key === key; })[0];
      var title = key || 'Other models';
      var desc = meta ? meta.desc : (key ? 'Other endpoint' : 'No chat or embedding endpoint (for example code-completion models)');
      var head = '<div class="model-group-head"><span class="model-group-title">' + esc(title) + '</span><span class="model-group-count">' + items.length + (items.length === 1 ? ' model' : ' models') + '</span></div><div class="model-group-desc">' + esc(desc) + '</div>';
      var grid = '<div class="model-list">' + items.map(function (m) {
        return '<button type="button" class="model-item" data-model="' + esc(m.id) + '" aria-expanded="' + (m.id === selectedModelId ? 'true' : 'false') + '"><span>' + esc(m.id) + '</span><span class="model-vendor">' + esc(m.owned_by || '') + '</span></button>';
      }).join('') + '</div>';
      out += '<div class="model-group">' + head + grid + '</div>';
    });
    return out;
  }

  function sampleForModel(m) {
    var key = primaryEndpoint(m);
    var msgs = [{ role: 'user', content: 'Say hi in five words.' }];
    if (key === '/v1/messages') return { method: 'POST', path: '/v1/messages', headers: ['anthropic-version: 2023-06-01'], body: { model: m.id, max_tokens: 100, messages: msgs }, id: 'messages' };
    if (key === '/responses') return { method: 'POST', path: '/v1/responses', headers: [], body: { model: m.id, input: 'Say hi in five words.', max_output_tokens: 100 }, id: 'responses' };
    if (key === '/chat/completions') return { method: 'POST', path: '/v1/chat/completions', headers: [], body: { model: m.id, messages: msgs, max_tokens: 100 }, id: 'chat' };
    if (key === '/embeddings') return { method: 'POST', path: '/v1/embeddings', headers: [], body: { model: m.id, input: ['hello world'] }, id: 'embeddings' };
    if (key === '/v1/decisions') return { method: 'POST', path: '/v1/decisions', headers: [], body: { model: 'gpt-6-luna', input: 'I was charged twice.', questions: [{ type: 'predicate', name: 'billing', instructions: 'Is this a billing issue?' }] }, id: 'decisions' };
    return null;
  }

  function renderModelDetail() {
    var box = $('model-detail');
    if (!box) return;
    var m = modelsData().filter(function (x) { return x.id === selectedModelId; })[0];
    if (!m) { box.className = ''; box.innerHTML = ''; return; }
    var caps = m.capabilities || {};
    var limits = caps.limits || {};
    var supports = caps.supports || {};
    var flags = Object.keys(supports).filter(function (k) { return supports[k]; }).map(function (k) {
      var v = supports[k];
      return '<span class="badge ok">' + esc(k) + (Array.isArray(v) ? ': ' + esc(v.join(', ')) : '') + '</span>';
    }).join(' ');
    var eps = usableEndpoints(m);
    var s = sampleForModel(m);
    var html = '<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px;flex-wrap:wrap"><h3>' + esc(m.id) + ' <span class="badge">' + esc(m.owned_by || '') + '</span></h3><button type="button" class="btn secondary" data-close-model="1">Close</button></div>';
    html += '<dl class="kv" style="margin:12px 0">';
    html += '<dt>Display name</dt><dd>' + esc(m.display_name || m.id) + '</dd>';
    html += '<dt>Endpoints</dt><dd>' + (eps.length ? esc(eps.join('  ')) : 'not declared (inferred: ' + esc(primaryEndpoint(m) || 'none') + ')') + '</dd>';
    html += '<dt>Capability type</dt><dd>' + esc(m.capability_type || caps.type || 'unknown') + '</dd>';
    if (caps.family) html += '<dt>Family</dt><dd>' + esc(caps.family) + '</dd>';
    if (limits.max_context_window_tokens) html += '<dt>Context window</dt><dd>' + num(limits.max_context_window_tokens) + ' tokens</dd>';
    if (limits.max_prompt_tokens) html += '<dt>Max prompt</dt><dd>' + num(limits.max_prompt_tokens) + ' tokens</dd>';
    if (limits.max_output_tokens) html += '<dt>Max output</dt><dd>' + num(limits.max_output_tokens) + ' tokens</dd>';
    if (caps.tokenizer) html += '<dt>Tokenizer</dt><dd>' + esc(caps.tokenizer) + '</dd>';
    html += '</dl>';
    if (flags) html += '<div style="margin-bottom:12px">' + flags + '</div>';
    if (s) {
      html += '<p class="note" style="margin:0 0 6px">Sample request for this model</p>' + codeBlock(buildCurl(s, JSON.stringify(s.body, null, 2)));
      html += '<p style="margin-top:10px"><button type="button" class="btn" data-try-model="' + esc(m.id) + '">Open in API Reference to try it</button></p>';
    } else {
      html += '<div class="empty">This model has no endpoint the proxy can call.</div>';
    }
    html += '</div>';
    box.innerHTML = html;
    box.className = 'open';
  }

  function renderModels() {
    var all = modelsData();
    if (!all.length) {
      $('panel-models').innerHTML = '<div class="empty">No models loaded. Check the server log and your Copilot entitlement.</div>';
      return;
    }
    var vendors = [];
    all.forEach(function (m) { if (m.owned_by && vendors.indexOf(m.owned_by) === -1) vendors.push(m.owned_by); });
    vendors.sort();
    var html = '<p class="lead">' + all.length + ' models available to your account, grouped by the endpoint each one is called on. Click a model for its limits, capabilities and a ready-to-run request.</p>';
    html += '<div class="toolbar"><input type="search" id="model-search" placeholder="Search models..." aria-label="Search models" value="' + esc(filter.q) + '">';
    html += '<select id="model-vendor" aria-label="Filter by vendor"><option value="">All vendors</option>' + vendors.map(function (v) { return '<option value="' + esc(v) + '"' + (filter.vendor === v ? ' selected' : '') + '>' + esc(v) + '</option>'; }).join('') + '</select></div>';
    html += '<div class="toolbar" id="endpoint-chips">' + ENDPOINTS.map(function (e) {
      return '<button type="button" class="chip-filter" data-endpoint="' + esc(e.key) + '" aria-pressed="' + (filter.endpoint === e.key ? 'true' : 'false') + '">' + esc(e.key) + '</button>';
    }).join('') + '</div>';
    html += '<div id="model-detail"></div><div id="model-groups">' + renderModelGroups() + '</div>';
    $('panel-models').innerHTML = html;
    renderModelDetail();
  }

  function refreshModelGroups() {
    $('model-groups').innerHTML = renderModelGroups();
    var chips = document.querySelectorAll('#endpoint-chips .chip-filter');
    for (var i = 0; i < chips.length; i++) {
      chips[i].setAttribute('aria-pressed', chips[i].getAttribute('data-endpoint') === filter.endpoint ? 'true' : 'false');
    }
  }

  /* --------------------------------------------------------- overview */
  function renderOverview() {
    var usage = data.usage;
    var premium = usage && usage.quota_snapshots ? usage.quota_snapshots.premium_interactions : null;
    var html = '<h2 class="section">Quick start</h2><div class="grid-3">';
    html += '<div class="card"><h3>1. Point your tool here</h3><p class="lead" style="margin:0">Base URL <code>' + esc(baseUrl) + '</code>. Any API key works, for example <code>dummy</code>.</p></div>';
    html += '<div class="card"><h3>2. Pick a model</h3><p class="lead" style="margin:0">Use the <b>Models</b> tab. Claude uses <code>/v1/messages</code>, GPT-5/6 uses <code>/responses</code>, everything else <code>/chat/completions</code>.</p></div>';
    html += '<div class="card"><h3>3. Try it</h3><p class="lead" style="margin:0">Open <b>API Reference</b>, edit a sample and press Send, or copy the curl.</p></div>';
    html += '</div>';

    html += '<h2 class="section">Premium interactions</h2>';
    if (premium) {
      var used = premium.entitlement ? Math.max(0, premium.entitlement - premium.remaining) : (premium.credits_used || 0);
      var percentUsed = premium.entitlement ? (used / premium.entitlement) * 100 : 100 - (premium.percent_remaining || 0);
      var fillClass = percentUsed > 90 ? ' high' : (percentUsed > 75 ? ' mid' : '');
      var reset = usage.quota_reset_date_utc ? new Date(usage.quota_reset_date_utc) : null;
      var daysLeft = reset ? Math.max(1, Math.ceil((reset.getTime() - Date.now()) / 86400000)) : null;
      html += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:13px">Credits used this cycle</b><span class="stat-sub">' + percentUsed.toFixed(1) + '% used</span></div>';
      html += '<div class="progress-track" role="progressbar" aria-valuenow="' + percentUsed.toFixed(0) + '" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill' + fillClass + '" style="width:' + Math.min(100, percentUsed) + '%"></div></div>';
      html += '<div class="grid-3">';
      html += '<div><div class="stat-label">Used</div><div class="stat-value">' + num(used) + '</div></div>';
      html += '<div><div class="stat-label">Remaining</div><div class="stat-value">' + num(premium.remaining) + '</div></div>';
      html += '<div><div class="stat-label">Entitlement</div><div class="stat-value">' + num(premium.entitlement) + '</div></div>';
      html += '</div>';
      if (reset) {
        html += '<p class="note">Resets ' + esc(reset.toISOString().slice(0, 10)) + ' (' + daysLeft + ' days). Budget to last the cycle: about ' + num(Math.floor(premium.remaining / daysLeft)) + ' credits per day.' + (premium.overage_permitted ? ' Overage is permitted.' : ' Overage is not permitted.') + '</p>';
      }
      html += '</div>';
    } else {
      html += '<div class="empty">No premium interactions data available.</div>';
    }

    if (usage) {
      html += '<h2 class="section">Account</h2><div class="card"><dl class="kv">';
      if (usage.login) html += '<dt>User</dt><dd>' + esc(usage.login) + '</dd>';
      if (usage.copilot_plan) html += '<dt>Plan</dt><dd>' + esc(usage.copilot_plan) + '</dd>';
      if (usage.access_type_sku) html += '<dt>SKU</dt><dd>' + esc(usage.access_type_sku) + '</dd>';
      html += '<dt>Billing</dt><dd>' + (usage.token_based_billing ? 'token-based (usage-based)' : 'request-based') + '</dd>';
      html += '<dt>Features</dt><dd>' + ['chat_enabled', 'cli_enabled', 'is_mcp_enabled', 'cloud_sessions_enabled'].filter(function (k) { return usage[k]; }).map(function (k) { return '<span class="badge ok">' + esc(k.replace('_enabled', '').replace('is_', '')) + '</span>'; }).join(' ') + '</dd>';
      html += '</dl></div>';
    }

    html += '<h2 class="section">Which endpoint should I use?</h2>';
    html += '<table class="tbl"><thead><tr><th>I use...</th><th>Call</th><th>Models</th></tr></thead><tbody>';
    html += '<tr><td>Claude Code, Claude Desktop, Anthropic SDK</td><td class="mono"><span class="method post">POST</span>/v1/messages</td><td>claude-* (native); others translated</td></tr>';
    html += '<tr><td>OpenAI SDK, Cursor, Continue</td><td class="mono"><span class="method post">POST</span>/v1/chat/completions</td><td>Claude, Gemini, Kimi, Azure OpenAI</td></tr>';
    html += '<tr><td>OpenAI Responses SDK</td><td class="mono"><span class="method post">POST</span>/v1/responses</td><td>GPT-5/6, Grok, Mai</td></tr>';
    html += '<tr><td>Classification and routing</td><td class="mono"><span class="method post">POST</span>/v1/decisions</td><td>gpt-6-luna</td></tr>';
    html += '<tr><td>Vector search</td><td class="mono"><span class="method post">POST</span>/v1/embeddings</td><td>text-embedding-*</td></tr>';
    html += '</tbody></table>';
    $('panel-overview').innerHTML = html;
  }

  /* ------------------------------------------------------ API / try it */
  function buildCurl(s, bodyText) {
    if (s.method === 'GET') return 'curl ' + baseUrl + s.path;
    var lines = ['curl' + (s.stream ? ' -N' : '') + ' ' + baseUrl + s.path, '  -H ' + DQ + 'Content-Type: application/json' + DQ];
    (s.headers || []).forEach(function (h) { lines.push('  -H ' + DQ + h + DQ); });
    lines.push('  -d ' + SQ + bodyText.split(SQ).join(SQ + DQ + SQ + DQ + SQ) + SQ);
    return lines.join(' ' + BS + NL);
  }

  function buildSamples() {
    var claude = pickModel('/v1/messages', ['claude-haiku-5.5'], 'claude-haiku-5.5');
    var gpt = pickModel('/responses', ['gpt-5.4-nano'], 'gpt-5.4-nano');
    var chat = pickModel('/chat/completions', ['gpt-4o', 'gemini-3.8-flash'], 'gpt-4o');
    var embed = pickModel('/embeddings', ['text-embedding-3-small'], 'text-embedding-3-small');
    var msgs = [{ role: 'user', content: 'Say hi in five words.' }];
    var ver = ['anthropic-version: 2023-06-01'];
    samples = [
      { id: 'chat', title: 'POST /v1/chat/completions', desc: 'OpenAI Chat Completions', method: 'POST', path: '/v1/chat/completions', headers: [], body: { model: chat, messages: msgs, max_tokens: 100 } },
      { id: 'chat-stream', title: 'POST /v1/chat/completions (streaming)', desc: 'Server-sent events', method: 'POST', path: '/v1/chat/completions', headers: [], stream: true, body: { model: chat, messages: msgs, max_tokens: 100, stream: true } },
      { id: 'messages', title: 'POST /v1/messages', desc: 'Anthropic Messages (Claude: native passthrough)', method: 'POST', path: '/v1/messages', headers: ver, body: { model: claude, max_tokens: 100, messages: msgs } },
      { id: 'messages-stream', title: 'POST /v1/messages (streaming)', desc: 'Anthropic SSE events', method: 'POST', path: '/v1/messages', headers: ver, stream: true, body: { model: claude, max_tokens: 100, stream: true, messages: msgs } },
      { id: 'count-tokens', title: 'POST /v1/messages/count_tokens', desc: 'Estimate input tokens for an Anthropic request', method: 'POST', path: '/v1/messages/count_tokens', headers: [], body: { model: claude, messages: msgs } },
      { id: 'responses', title: 'POST /v1/responses', desc: 'OpenAI Responses (GPT-5/6, Grok, Mai)', method: 'POST', path: '/v1/responses', headers: [], body: { model: gpt, input: 'Say hi in five words.', max_output_tokens: 100 } },
      { id: 'decisions', title: 'POST /v1/decisions', desc: 'Typed answers: predicate, choice or score. gpt-6-luna maps to gpt-6-luna-decisions', method: 'POST', path: '/v1/decisions', headers: [], body: { model: 'gpt-6-luna', input: 'I was charged twice for my order.', questions: [{ type: 'choice', name: 'department', instructions: 'Which department should handle this complaint?', choices: [{ value: 'billing', description: 'Payments, invoices, and refunds.' }, { value: 'shipping', description: 'Delivery and tracking.' }] }] } },
      { id: 'embeddings', title: 'POST /v1/embeddings', desc: 'Embeddings. A string input is wrapped into an array', method: 'POST', path: '/v1/embeddings', headers: [], body: { model: embed, input: ['hello world'] } },
      { id: 'models', title: 'GET /v1/models', desc: 'Models with supported_endpoints, capability_type and capabilities', method: 'GET', path: '/v1/models', headers: [], body: null },
      { id: 'usage', title: 'GET /usage', desc: 'Copilot quota and entitlement', method: 'GET', path: '/usage', headers: [], body: null }
    ];
  }

  function renderSample(s, index) {
    var bodyText = s.body ? JSON.stringify(s.body, null, 2) : '';
    var out = '<details class="sample" id="sample-' + esc(s.id) + '" data-index="' + index + '"><summary><span class="sample-title"><span class="method ' + (s.method === 'GET' ? 'get' : 'post') + '">' + s.method + '</span>' + esc(s.title.replace(s.method + ' ', '')) + '</span><span class="sample-desc">' + esc(s.desc) + '</span></summary><div class="sample-body">';
    if (s.body) {
      out += '<div><label for="body-' + index + '">Request body (editable)</label><textarea id="body-' + index + '" spellcheck="false" data-body="' + index + '">' + esc(bodyText) + '</textarea></div>';
    }
    out += '<div><label>curl</label><div id="curl-' + index + '">' + codeBlock(buildCurl(s, bodyText)) + '</div></div>';
    out += '<div class="send-row"><button type="button" class="btn" data-send="' + index + '">Send request</button><span class="send-status" id="status-' + index + '"></span></div>';
    out += '<div class="response" id="resp-' + index + '"></div>';
    out += '</div></details>';
    return out;
  }

  function renderApi() {
    buildSamples();
    var html = '<p class="lead">Every endpoint the proxy serves, with an editable request, a live curl command and a Send button that calls this server directly from your browser.</p>';
    html += '<div class="callout warn"><b>Send makes a real request</b> and uses Copilot credits. The default payloads are tiny. Edit the body to try other models or options.</div>';
    html += '<h2 class="section">Endpoints</h2><table class="tbl"><thead><tr><th>Endpoint</th><th>Description</th></tr></thead><tbody>';
    html += '<tr><td class="mono"><span class="method post">POST</span>/v1/chat/completions</td><td>OpenAI Chat Completions</td></tr>';
    html += '<tr><td class="mono"><span class="method post">POST</span>/v1/messages</td><td>Anthropic Messages (Claude native; others translated)</td></tr>';
    html += '<tr><td class="mono"><span class="method post">POST</span>/v1/messages/count_tokens</td><td>Token estimate for an Anthropic request</td></tr>';
    html += '<tr><td class="mono"><span class="method post">POST</span>/v1/responses</td><td>OpenAI Responses (GPT, Grok, Mai)</td></tr>';
    html += '<tr><td class="mono"><span class="method post">POST</span>/v1/decisions</td><td>OpenAI Decisions (gpt-6-luna mapped to gpt-6-luna-decisions)</td></tr>';
    html += '<tr><td class="mono"><span class="method post">POST</span>/v1/embeddings</td><td>Embeddings</td></tr>';
    html += '<tr><td class="mono"><span class="method get">GET</span>/v1/models</td><td>List models</td></tr>';
    html += '<tr><td class="mono"><span class="method get">GET</span>/usage</td><td>Quota and usage (JSON)</td></tr>';
    html += '<tr><td class="mono"><span class="method get">GET</span>/token</td><td>Copilot token (403 unless started with --show-token)</td></tr>';
    html += '<tr><td class="mono"><span class="method get">GET</span>/openapi.yaml</td><td>OpenAPI description of this proxy (<a href="/openapi.yaml" target="_blank" rel="noopener">open</a>)</td></tr>';
    html += '</tbody></table><p class="note">Routes without the <code>/v1</code> prefix (for example <code>/chat/completions</code>) also work.</p>';
    html += '<h2 class="section">Try it</h2>' + samples.map(renderSample).join('');
    $('panel-api').innerHTML = html;
  }

  function updateCurl(index) {
    var s = samples[index];
    var ta = $('body-' + index);
    var text = ta ? ta.value : '';
    $('curl-' + index).innerHTML = codeBlock(buildCurl(s, text));
  }

  function setBodyModel(index, modelId) {
    var ta = $('body-' + index);
    if (!ta) return;
    try {
      var obj = JSON.parse(ta.value);
      obj.model = modelId;
      ta.value = JSON.stringify(obj, null, 2);
      updateCurl(index);
    } catch (e) { /* leave as typed */ }
  }

  function sendSample(index) {
    var s = samples[index];
    var btn = document.querySelector('[data-send="' + index + '"]');
    var status = $('status-' + index);
    var resp = $('resp-' + index);
    var bodyText = null;
    if (s.method !== 'GET') {
      bodyText = $('body-' + index).value;
      try { JSON.parse(bodyText); } catch (e) {
        status.className = 'send-status err';
        status.textContent = 'Invalid JSON: ' + e.message;
        return;
      }
    }
    var headers = {};
    if (s.method !== 'GET') headers['Content-Type'] = 'application/json';
    (s.headers || []).forEach(function (h) { var i = h.indexOf(':'); headers[h.slice(0, i).trim()] = h.slice(i + 1).trim(); });
    var started = Date.now();
    btn.disabled = true;
    status.className = 'send-status';
    status.textContent = 'Sending...';
    resp.textContent = '';
    resp.className = 'response has-content';
    var MAX = 30000;
    var shown = '';
    fetch(baseUrl + s.path, { method: s.method, headers: headers, body: bodyText })
      .then(function (r) {
        var ok = r.ok;
        var label = 'HTTP ' + r.status;
        var ctype = r.headers.get('content-type') || '';
        if (!r.body || !r.body.getReader || ctype.indexOf('event-stream') === -1) {
          return r.text().then(function (t) {
            try { t = JSON.stringify(JSON.parse(t), null, 2); } catch (e) { /* not JSON */ }
            resp.textContent = t.length > MAX ? t.slice(0, MAX) + NL + '... truncated' : t;
            return { ok: ok, label: label };
          });
        }
        var reader = r.body.getReader();
        var decoder = new TextDecoder();
        function pump() {
          return reader.read().then(function (chunk) {
            if (chunk.done) return { ok: ok, label: label + ' (stream)' };
            if (shown.length < MAX) {
              shown += decoder.decode(chunk.value, { stream: true });
              resp.textContent = shown.length > MAX ? shown.slice(0, MAX) + NL + '... truncated' : shown;
            }
            return pump();
          });
        }
        return pump();
      })
      .then(function (result) {
        status.className = 'send-status ' + (result.ok ? 'ok' : 'err');
        status.textContent = result.label + '  ' + (Date.now() - started) + ' ms';
      })
      .catch(function (e) {
        status.className = 'send-status err';
        status.textContent = 'Request failed: ' + e.message;
      })
      .then(function () { btn.disabled = false; });
  }

  function openSample(id) {
    window.location.hash = 'api';
    var d = $('sample-' + id);
    if (d) { d.open = true; d.scrollIntoView(); }
  }

  /* ---------------------------------------------------------- connect */
  function renderConnect() {
    var opus = latestClaude('opus', 'claude-opus-5.5');
    var sonnet = latestClaude('sonnet', 'claude-sonnet-5.5');
    var haiku = latestClaude('haiku', 'claude-haiku-5.5');
    var claudeIds = modelsData().filter(function (m) { return usableEndpoints(m).indexOf('/v1/messages') !== -1; }).map(function (m) { return m.id; });
    var ccConfig = JSON.stringify({
      env: {
        ANTHROPIC_BASE_URL: baseUrl,
        ANTHROPIC_AUTH_TOKEN: 'dummy',
        ANTHROPIC_MODEL: opus,
        ANTHROPIC_DEFAULT_SONNET_MODEL: sonnet,
        ANTHROPIC_DEFAULT_OPUS_MODEL: opus,
        ANTHROPIC_DEFAULT_HAIKU_MODEL: haiku,
        DISABLE_NON_ESSENTIAL_MODEL_CALLS: '1',
        CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1'
      },
      permissions: { deny: ['WebSearch'] }
    }, null, 2);
    var desktopConfig = JSON.stringify({
      inferenceProvider: 'gateway',
      inferenceGatewayBaseUrl: baseUrl,
      inferenceGatewayApiKey: 'dummy',
      inferenceModels: claudeIds
    }, null, 2);
    var py = ['from openai import OpenAI', '', 'client = OpenAI(base_url=' + DQ + baseUrl + '/v1' + DQ + ', api_key=' + DQ + 'dummy' + DQ + ')', 'reply = client.chat.completions.create(', '    model=' + DQ + pickModel('/chat/completions', ['gpt-4o'], 'gpt-4o') + DQ + ',', '    messages=[{' + DQ + 'role' + DQ + ': ' + DQ + 'user' + DQ + ', ' + DQ + 'content' + DQ + ': ' + DQ + 'Hello' + DQ + '}],', ')', 'print(reply.choices[0].message.content)'].join(NL);
    var js = ['import OpenAI from ' + DQ + 'openai' + DQ + ';', '', 'const client = new OpenAI({ baseURL: ' + DQ + baseUrl + '/v1' + DQ + ', apiKey: ' + DQ + 'dummy' + DQ + ' });', 'const reply = await client.responses.create({', '  model: ' + DQ + pickModel('/responses', ['gpt-5.4-nano'], 'gpt-5.4-nano') + DQ + ',', '  input: ' + DQ + 'Hello' + DQ + ',', '});', 'console.log(reply.output_text);'].join(NL);
    var anth = ['from anthropic import Anthropic', '', 'client = Anthropic(base_url=' + DQ + baseUrl + DQ + ', api_key=' + DQ + 'dummy' + DQ + ')', 'reply = client.messages.create(', '    model=' + DQ + haiku + DQ + ',', '    max_tokens=100,', '    messages=[{' + DQ + 'role' + DQ + ': ' + DQ + 'user' + DQ + ', ' + DQ + 'content' + DQ + ': ' + DQ + 'Hello' + DQ + '}],', ')', 'print(reply.content[0].text)'].join(NL);
    var env = ['export OPENAI_BASE_URL=' + baseUrl + '/v1', 'export OPENAI_API_KEY=dummy', 'export ANTHROPIC_BASE_URL=' + baseUrl, 'export ANTHROPIC_AUTH_TOKEN=dummy'].join(NL);

    var html = '<p class="lead">Copy-paste setups for common clients. The API key is never checked, so any value works.</p>';
    html += '<h2 class="section">Claude Code</h2><div class="grid-2"><div>';
    html += '<p class="lead">Add to <code>.claude/settings.json</code>. Model names are the newest Claude models found on your account.</p>' + codeBlock(ccConfig);
    html += '</div><div><p class="lead">Or let the proxy build the command for you:</p>' + codeBlock('node dist/main.js start --claude-code') + '<p class="note">It prompts for a main and a small model, then copies a ready-to-run <code>claude</code> command to the clipboard.</p></div></div>';

    html += '<h2 class="section">Claude Desktop</h2>';
    html += '<p class="lead">Claude Desktop can use this proxy as a third-party inference gateway, without signing in to Anthropic.</p>';
    html += '<div class="grid-2"><div class="steps card"><ol>';
    html += '<li>Launch Claude Desktop and <b>do not sign in</b>. If the menu button does not respond, click the email field, press <b>Tab</b>, then <b>Enter</b>.</li>';
    html += '<li>Open <b>Menu &rarr; Help &rarr; Troubleshooting &rarr; Enable Developer Mode</b>.</li>';
    html += '<li>Open <b>Menu &rarr; Developer &rarr; Configure Third-Party Inference&hellip;</b> and choose <b>Gateway</b> (Anthropic-compatible).</li>';
    html += '<li>Fill in the fields on the right, then click <b>Apply locally</b>.</li>';
    html += '</ol></div><div>';
    html += '<table class="tbl"><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>';
    html += '<tr><td>Gateway base URL</td><td class="mono">' + esc(baseUrl) + '</td></tr>';
    html += '<tr><td>Gateway API key</td><td class="mono">dummy</td></tr>';
    html += '<tr><td>Gateway auth scheme</td><td class="mono">bearer (default)</td></tr>';
    html += '<tr><td>Gateway extra headers</td><td>leave empty</td></tr></tbody></table>';
    html += '<p class="note">No trailing <code>/</code> and no <code>/v1</code>: Desktop appends <code>/v1/messages</code> and <code>/v1/models</code> itself.</p></div></div>';
    html += '<p class="lead" style="margin-top:16px">If the model dropdown stays empty, use <b>Export &rarr; Open in file manager</b>, add this to the Claude Desktop JSON config, then fully quit and relaunch the app:</p>' + codeBlock(desktopConfig);
    html += '<div class="callout warn">Gateway mode runs local sessions only. Claude Cowork and Remote Control are not covered, and claude.ai in the browser is unaffected. Desktop may require HTTPS for the gateway: if it refuses a plain <code>http://localhost</code> URL, put a TLS front in front of the proxy.</div>';
    html += '<p class="note">References: <a href="https://code.claude.com/docs/en/llm-gateway-connect" target="_blank" rel="noopener">Anthropic gateway docs</a> &middot; <a href="https://docs.qcode.cc/en/docs/ide/claude-desktop" target="_blank" rel="noopener">third-party setup guide</a></p>';

    html += '<h2 class="section">OpenAI and Anthropic SDKs</h2><div class="grid-2"><div><h3>Python: chat completions</h3>' + codeBlock(py) + '</div><div><h3>JavaScript: responses</h3>' + codeBlock(js) + '</div></div>';
    html += '<div class="grid-2" style="margin-top:16px"><div><h3>Python: Anthropic SDK</h3>' + codeBlock(anth) + '</div><div><h3>Environment variables</h3>' + codeBlock(env) + '<p class="note">Many tools (Cursor, Continue, Aider, LangChain) read these.</p></div></div>';
    $('panel-connect').innerHTML = html;
  }

  /* ------------------------------------------------------------- data */
  function renderAll() {
    renderOverview();
    renderModels();
    renderApi();
    renderConnect();
  }

  function fetchAll() {
    setStatus('', 'Fetching');
    return Promise.all([
      fetch(baseUrl + '/usage').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch(baseUrl + '/v1/models').then(function (r) { return r.ok ? r.json() : null; })
    ]).then(function (res) {
      data.usage = res[0];
      data.models = res[1];
      setStatus('ok', 'Connected');
      var open = {};
      var details = document.querySelectorAll('details.sample[open]');
      for (var i = 0; i < details.length; i++) open[details[i].id] = true;
      var edited = document.querySelector('#panel-api textarea:focus');
      if (!edited) {
        renderAll();
        Object.keys(open).forEach(function (id) { var d = $(id); if (d) d.open = true; });
      } else {
        renderOverview();
      }
    }).catch(function (e) {
      setStatus('err', 'Error');
      $('panel-overview').innerHTML = '<div class="callout danger">Could not load data from the server: ' + esc(e.message || 'unknown error') + '</div>';
    });
  }

  /* ----------------------------------------------------------- events */
  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!(t instanceof Element)) return;

    var tab = t.closest('.tab');
    if (tab) { window.location.hash = tab.getAttribute('data-tab'); return; }

    var copy = t.closest('.copy-btn');
    if (copy) {
      var text = '';
      var targetId = copy.getAttribute('data-copy-target');
      if (targetId) text = $(targetId).textContent;
      else { var block = copy.parentElement.querySelector('.code-text'); text = block ? block.textContent : ''; }
      var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy'; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done);
      return;
    }

    var chip = t.closest('.chip-filter');
    if (chip) {
      var ep = chip.getAttribute('data-endpoint');
      filter.endpoint = filter.endpoint === ep ? '' : ep;
      refreshModelGroups();
      return;
    }

    var model = t.closest('.model-item');
    if (model) {
      var id = model.getAttribute('data-model');
      selectedModelId = selectedModelId === id ? null : id;
      renderModelDetail();
      refreshModelGroups();
      var box = $('model-detail');
      if (selectedModelId && box) box.scrollIntoView({ block: 'nearest' });
      return;
    }

    if (t.closest('[data-close-model]')) { selectedModelId = null; renderModelDetail(); refreshModelGroups(); return; }

    var tryModel = t.closest('[data-try-model]');
    if (tryModel) {
      var m = modelsData().filter(function (x) { return x.id === tryModel.getAttribute('data-try-model'); })[0];
      var s = m ? sampleForModel(m) : null;
      if (s) {
        var idx = -1;
        samples.forEach(function (x, i) { if (x.id === s.id) idx = i; });
        openSample(s.id);
        if (idx >= 0) setBodyModel(idx, m.id);
      }
      return;
    }

    var send = t.closest('[data-send]');
    if (send) { sendSample(parseInt(send.getAttribute('data-send'), 10)); return; }
  });

  document.addEventListener('input', function (ev) {
    var t = ev.target;
    if (t.id === 'model-search') { filter.q = t.value; refreshModelGroups(); }
    else if (t.getAttribute && t.getAttribute('data-body') !== null) { updateCurl(parseInt(t.getAttribute('data-body'), 10)); }
  });

  document.addEventListener('change', function (ev) {
    if (ev.target.id === 'model-vendor') { filter.vendor = ev.target.value; refreshModelGroups(); }
  });

  document.addEventListener('keydown', function (ev) {
    var t = ev.target;
    if (!(t instanceof Element) || !t.classList.contains('tab')) return;
    var i = TABS.indexOf(t.getAttribute('data-tab'));
    if (ev.key === 'ArrowRight') i = (i + 1) % TABS.length;
    else if (ev.key === 'ArrowLeft') i = (i + TABS.length - 1) % TABS.length;
    else return;
    ev.preventDefault();
    window.location.hash = TABS[i];
    $('tab-btn-' + TABS[i]).focus();
  });

  window.addEventListener('hashchange', route);

  $('base-url').textContent = baseUrl;
  route();
  fetchAll();
  setInterval(fetchAll, 60000);
})();
`
