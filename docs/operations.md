# Operations

## Install and run (Node)

```sh
git clone https://<host>/<org>/copilot-api-ghe.git
cd copilot-api-ghe
npm install
npm run build
node dist/main.js start
```

Pick the GitHub host with `--host` / `-h` (or `GITHUB_HOST`), for example `start -h company.ghe.com`. First run starts the GitHub device sign-in for that host: open the printed URL, enter the code, approve. The proxy then listens on `http://localhost:4141` and the dashboard is at `/dashboard`.

## Commands and flags

| Command | Purpose |
| --- | --- |
| `start` | Start the server |
| `auth` | Run the sign-in flow only and write the token file |
| `check-usage` | Print Copilot usage in the terminal |
| `debug` | Print diagnostic information |

`start` flags (`src/start.ts`):

| Flag | Default | Purpose |
| --- | --- | --- |
| `--host`, `-h` | `$GITHUB_HOST` or `github.com` | GitHub host: `github.com`, `<name>.ghe.com` or a GitHub Enterprise Server host. URLs are accepted. Also available on `auth`, `check-usage` and `debug` |
| `--port`, `-p` | `4141` | Port to listen on |
| `--verbose`, `-v` | off | Debug logging |
| `--account-type`, `-a` | `individual` | `individual`, `business` or `enterprise` (used only when the Copilot token response has no API base URL; for GHE the base URL comes from the token) |
| `--manual` | off | Ask in the terminal before each request |
| `--rate-limit`, `-r` | none | Minimum seconds between requests |
| `--wait`, `-w` | off | Wait instead of returning an error when the rate limit is hit |
| `--github-token`, `-g` | token file | Use this GitHub token instead of the saved one |
| `--claude-code`, `-c` | off | Pick models and copy a ready-to-run Claude Code command |
| `--show-token` | off | Print tokens on fetch and refresh, and enable `GET /token` |
| `--proxy-env` | off | Use `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` from the environment |

`auth` flags: `--host`, `--verbose`, `--show-token`.

Host resolution:

| Host | Web / login | API | Copilot API fallback |
| --- | --- | --- | --- |
| `github.com` | `https://github.com` | `https://api.github.com` | `api.githubcopilot.com` (or `api.<account-type>.githubcopilot.com`) |
| `*.ghe.com` | `https://<host>` | `https://api.<host>` | `https://copilot-api.<host>` |
| other (GHES) | `https://<host>` | `https://<host>/api/v3` | `https://copilot-api.<host>` |

The `endpoints.api` value in the Copilot token response always wins over the fallback. `GITHUB_CLIENT_ID` overrides the OAuth client ID (useful on GHES).

## Docker

```sh
docker build -t copilot-api .

# first time: sign in (writes the token to the mounted volume)
docker run -it --rm -v "$PWD/copilot-data:/root/.local/share/copilot-api" copilot-api --auth

# run
docker run -d --name copilot-api -p 4141:4141 \
  -v "$PWD/copilot-data:/root/.local/share/copilot-api" copilot-api
```

- `entrypoint.sh` runs `start -g "$GH_TOKEN" "$@"`. With no `GH_TOKEN` it falls back to the token file in the volume. Extra arguments are passed to `start` (for example `--rate-limit 2 --wait`).
- The volume **is your credential store**. `copilot-data/` is git-ignored and docker-ignored; never commit or bake it into an image.
- Updating a running container: rebuild the image, then stop and remove the container and run it again with the same volume. The token survives because it lives in the volume.
- Health check: the image polls `http://localhost:4141/`.

## Token files and refresh

| Item | Location | Lifetime |
| --- | --- | --- |
| GitHub token | `~/.local/share/copilot-api/github_token.<host>` (mode 600, one per host; the old unsuffixed `github_token` is no longer read, so sign in again once) | Long-lived until revoked |
| Copilot token | memory only | Short-lived; refreshed automatically `refresh_in - 60` seconds after each fetch |

To sign in again: run `auth` (or delete the token file). To revoke access: remove the OAuth app authorization in your GitHub settings.

## Security

- **The proxy has no authentication.** Any API key is accepted. Anyone who can reach the port can spend your Copilot credits. Bind it to localhost or restrict it at the network level. Do not expose it publicly.
- `GET /token` is disabled unless `--show-token` is set.
- The dashboard **Try it** buttons make real requests and spend credits.
- Prompts and responses are not logged by default; `--verbose` logs request payloads.
- Copilot internal endpoints are undocumented and may change. See `upstream-copilot-api.openapi.yaml` for what has been verified.

## Development

```sh
npm run build        # tsdown bundle to dist/
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run docs:sync    # regenerate src/routes/openapi/spec.ts from docs/openapi.yaml
npm run docs:check   # verify docs cover routes, flags and the generated spec
```

Bun is used by the Docker image and the original scripts (`bun run dev`, `bun test`); the Node scripts above work without it.
