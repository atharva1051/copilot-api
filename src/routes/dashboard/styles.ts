export const dashboardStyles = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #ffffff;
      --bg-card: #f6f8fa;
      --border: #d0d7de;
      --border-strong: #afb8c1;
      --fg: #1f2328;
      --fg-muted: #57606a;
      --fg-dim: #6e7781;
      --accent: #0969da;
      --accent-soft: #ddf4ff;
      --ok: #1a7f37;
      --ok-soft: #dafbe1;
      --warn: #9a6700;
      --warn-soft: #fff8c5;
      --danger: #cf222e;
      --danger-soft: #ffebe9;
      --bar-bg: #d8dee4;
      --mono: 'SF Mono', 'Fira Code', Menlo, Consolas, monospace;
    }

    html { scroll-behavior: smooth; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--fg);
      line-height: 1.5;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    code { font-family: var(--mono); font-size: 12px; background: var(--bg-card); border: 1px solid var(--border); padding: 1px 5px; border-radius: 4px; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    .container { max-width: 1040px; margin: 0 auto; padding: 0 24px 64px; }

    /* ---- header ---- */
    .app-header { padding: 28px 0 16px; display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; justify-content: space-between; }
    .app-title h1 { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
    .app-title p { font-size: 13px; color: var(--fg-muted); }
    .status-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 10px; border-radius: 999px; background: var(--bg-card); border: 1px solid var(--border); color: var(--fg-muted); margin-top: 8px; }
    .status-pill .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--fg-dim); }
    .status-pill.ok { background: var(--ok-soft); color: var(--ok); border-color: #aceebb; }
    .status-pill.ok .dot { background: var(--ok); }
    .status-pill.err { background: var(--danger-soft); color: var(--danger); border-color: #ffcecb; }
    .status-pill.err .dot { background: var(--danger); }
    .base-url { display: flex; align-items: center; gap: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 6px 6px 6px 12px; }
    .base-url .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--fg-dim); }
    .base-url code { background: transparent; border: none; font-size: 13px; padding: 0; }

    /* ---- tabs ---- */
    .tabs { position: sticky; top: 0; z-index: 10; background: rgba(255,255,255,0.95); backdrop-filter: blur(6px); border-bottom: 1px solid var(--border); display: flex; gap: 4px; overflow-x: auto; margin-bottom: 28px; }
    .tab { appearance: none; background: none; border: none; border-bottom: 2px solid transparent; padding: 12px 14px; font: inherit; font-size: 13px; font-weight: 500; color: var(--fg-muted); cursor: pointer; white-space: nowrap; }
    .tab:hover { color: var(--fg); }
    .tab[aria-selected="true"] { color: var(--accent); border-bottom-color: var(--accent); }
    .tab:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
    .panel { display: none; }
    .panel.active { display: block; }

    /* ---- shared blocks ---- */
    h2.section { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg-muted); margin: 32px 0 12px; }
    h2.section:first-child { margin-top: 0; }
    h3 { font-size: 15px; font-weight: 600; margin: 0 0 6px; }
    p.lead { font-size: 14px; color: var(--fg-muted); margin-bottom: 12px; max-width: 760px; }
    p.note { font-size: 12px; color: var(--fg-dim); margin-top: 8px; }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 20px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .callout { border: 1px solid var(--border); border-left: 4px solid var(--accent); background: var(--accent-soft); border-radius: 6px; padding: 12px 16px; font-size: 13px; margin: 12px 0; }
    .callout.warn { border-left-color: var(--warn); background: var(--warn-soft); }
    .callout.danger { border-left-color: var(--danger); background: var(--danger-soft); }

    .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--fg-dim); margin-bottom: 2px; }
    .stat-value { font-size: 18px; font-family: var(--mono); }
    .stat-sub { font-size: 11px; color: var(--fg-dim); }
    .progress-track { width: 100%; height: 6px; background: var(--bar-bg); border-radius: 3px; margin: 12px 0 16px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--accent); transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
    .progress-fill.mid { background: var(--warn); }
    .progress-fill.high { background: var(--danger); }
    .kv { display: grid; grid-template-columns: 140px 1fr; gap: 6px 12px; font-size: 13px; }
    .kv dt { color: var(--fg-dim); }
    .kv dd { font-family: var(--mono); font-size: 12px; }
    .badge { display: inline-block; font-size: 10px; font-weight: 600; padding: 1px 8px; border-radius: 999px; border: 1px solid var(--border); background: var(--bg); color: var(--fg-muted); white-space: nowrap; }
    .badge.ok { background: var(--ok-soft); color: var(--ok); border-color: #aceebb; }
    .badge.warn { background: var(--warn-soft); color: var(--warn); border-color: #eac54f; }
    .badge.info { background: var(--accent-soft); color: var(--accent); border-color: #b6e3ff; }

    table.tbl { width: 100%; border-collapse: collapse; font-size: 13px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
    table.tbl th, table.tbl td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--border); vertical-align: top; }
    table.tbl th { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--fg-dim); font-weight: 600; background: var(--bg-card); }
    table.tbl tr:last-child td { border-bottom: none; }
    table.tbl td.mono, table.tbl .mono { font-family: var(--mono); font-size: 12px; }
    .method { display: inline-block; min-width: 40px; margin-right: 6px; font-weight: 700; font-size: 11px; font-family: var(--mono); }
    .method.get { color: var(--ok); }
    .method.post { color: var(--accent); }

    /* ---- code ---- */
    .code-block { position: relative; background: #fff; border: 1px solid var(--border); border-radius: 6px; padding: 14px 16px; font-family: var(--mono); font-size: 12px; line-height: 1.6; color: var(--fg); overflow-x: auto; white-space: pre; }
    .code-block.has-copy { padding-right: 76px; }
    .copy-btn { position: absolute; top: 8px; right: 8px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 4px; color: var(--fg-muted); padding: 3px 10px; font: inherit; font-size: 11px; cursor: pointer; }
    .copy-btn:hover { color: var(--accent); border-color: var(--accent); }
    .btn { appearance: none; background: var(--accent); color: #fff; border: 1px solid var(--accent); border-radius: 6px; padding: 6px 14px; font: inherit; font-size: 13px; font-weight: 500; cursor: pointer; }
    .btn:hover { filter: brightness(0.93); }
    .btn:disabled { opacity: 0.55; cursor: wait; }
    .btn.secondary { background: var(--bg-card); color: var(--fg); border-color: var(--border); }

    /* ---- models ---- */
    .toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 16px; }
    .toolbar input[type=search], .toolbar select { font: inherit; font-size: 13px; padding: 7px 10px; border: 1px solid var(--border-strong); border-radius: 6px; background: #fff; color: var(--fg); }
    .toolbar input[type=search] { flex: 1; min-width: 200px; }
    .chip-filter { appearance: none; font: inherit; font-size: 12px; font-family: var(--mono); padding: 4px 10px; border-radius: 999px; border: 1px solid var(--border); background: #fff; color: var(--fg-muted); cursor: pointer; }
    .chip-filter[aria-pressed="true"] { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
    .model-group { margin-bottom: 24px; }
    .model-group-head { display: flex; align-items: baseline; gap: 10px; }
    .model-group-title { font-size: 14px; font-weight: 600; font-family: var(--mono); color: var(--accent); }
    .model-group-count { font-size: 11px; color: var(--fg-dim); }
    .model-group-desc { font-size: 12px; color: var(--fg-muted); margin: 2px 0 10px; }
    .model-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 8px; }
    .model-item { appearance: none; text-align: left; font: inherit; background: #fff; border: 1px solid var(--border); border-radius: 6px; padding: 9px 12px; font-size: 12px; font-family: var(--mono); color: var(--fg); cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .model-item:hover, .model-item[aria-expanded="true"] { border-color: var(--accent); background: var(--accent-soft); }
    .model-item:focus-visible { outline: 2px solid var(--accent); }
    .model-vendor { font-size: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: var(--fg-muted); background: var(--bg-card); border: 1px solid var(--border); padding: 0 6px; border-radius: 10px; white-space: nowrap; }
    #model-detail { margin: 0 0 24px; display: none; }
    #model-detail.open { display: block; }
    details.collapsible > summary { cursor: pointer; list-style: none; }
    details.collapsible > summary::-webkit-details-marker { display: none; }
    details.collapsible > summary::before { content: '\\25B8'; color: var(--fg-dim); margin-right: 6px; }
    details.collapsible[open] > summary::before { content: '\\25BE'; }

    /* ---- samples / try it ---- */
    .sample { background: #fff; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 10px; }
    .sample > summary { cursor: pointer; padding: 12px 16px; list-style: none; display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; }
    .sample > summary::-webkit-details-marker { display: none; }
    .sample[open] > summary { border-bottom: 1px solid var(--border); background: var(--bg-card); border-radius: 8px 8px 0 0; }
    .sample-title { font-family: var(--mono); font-size: 13px; font-weight: 600; }
    .sample-desc { font-size: 12px; color: var(--fg-muted); }
    .sample-body { padding: 16px; display: grid; gap: 12px; }
    .sample-body label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--fg-dim); display: block; margin-bottom: 4px; }
    .sample-body textarea { width: 100%; min-height: 140px; font-family: var(--mono); font-size: 12px; line-height: 1.5; padding: 10px 12px; border: 1px solid var(--border-strong); border-radius: 6px; resize: vertical; color: var(--fg); background: #fff; }
    .send-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .send-status { font-size: 12px; font-family: var(--mono); color: var(--fg-muted); }
    .send-status.ok { color: var(--ok); }
    .send-status.err { color: var(--danger); }
    .response { max-height: 320px; overflow: auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; padding: 10px 12px; font-family: var(--mono); font-size: 12px; white-space: pre-wrap; word-break: break-word; display: none; }
    .response.has-content { display: block; }

    .steps ol { padding-left: 20px; font-size: 13px; color: var(--fg-muted); }
    .steps li { margin-bottom: 6px; }
    .steps b { color: var(--fg); font-weight: 600; }

    /* ---- docs ---- */
    .docs-nav { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 13px; margin-bottom: 8px; }
    .diagram { background: #fff; border: 1px solid var(--border); border-radius: 8px; padding: 12px; overflow-x: auto; }
    .diagram svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
    .diagram text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; fill: #1f2328; }
    .diagram .t-small { font-size: 10.5px; fill: #57606a; }
    .diagram .t-bold { font-weight: 600; }

    .loading { display: flex; align-items: center; justify-content: center; padding: 80px 0; }
    .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty { font-size: 13px; color: var(--fg-muted); padding: 16px; border: 1px dashed var(--border-strong); border-radius: 6px; }

    @media (max-width: 760px) {
      .container { padding: 0 16px 48px; }
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .kv { grid-template-columns: 110px 1fr; }
    }
`
