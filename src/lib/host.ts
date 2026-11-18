import { state } from "./state"

export const DEFAULT_HOST = "github.com"

export interface ResolvedHost {
  host: string
  kind: "dotcom" | "ghec" | "ghes"
  webUrl: string
  apiUrl: string
  copilotApiUrl?: string
}

export function normalizeHost(input: string): string {
  const host = input
    .trim()
    .replace(/^[a-z][a-z\d+.-]*:\/\//i, "")
    .split(/[/?#]/, 1)[0]
    .toLowerCase()
  if (!host) throw new Error(`Invalid GitHub host: "${input}"`)
  return host
}

export function resolveHost(input: string): ResolvedHost {
  const host = normalizeHost(input)

  if (host === "github.com" || host === "www.github.com") {
    return {
      host: "github.com",
      kind: "dotcom",
      webUrl: "https://github.com",
      apiUrl: "https://api.github.com",
    }
  }

  if (host.endsWith(".ghe.com")) {
    return {
      host,
      kind: "ghec",
      webUrl: `https://${host}`,
      apiUrl: `https://api.${host}`,
      copilotApiUrl: `https://copilot-api.${host}`,
    }
  }

  return {
    host,
    kind: "ghes",
    webUrl: `https://${host}`,
    apiUrl: `https://${host}/api/v3`,
    copilotApiUrl: `https://copilot-api.${host}`,
  }
}

export function applyHost(input?: string): ResolvedHost {
  const resolved = resolveHost(input || process.env.GITHUB_HOST || DEFAULT_HOST)
  state.githubHost = resolved.host
  state.githubBaseUrl = resolved.webUrl
  state.githubApiBaseUrl = resolved.apiUrl
  state.copilotFallbackUrl = resolved.copilotApiUrl
  return resolved
}

export const hostArg = {
  host: {
    alias: "h",
    type: "string",
    description:
      "GitHub host: github.com, <name>.ghe.com or a GitHub Enterprise Server host (default: $GITHUB_HOST or github.com)",
  },
} as const

// citty treats `-h` as --help; rewrite `-h <value>` into `--host <value>`
export function rewriteHostFlag(rawArgs: Array<string>): Array<string> {
  return rawArgs.flatMap((arg, i) => {
    if (arg === "-h" && rawArgs[i + 1] && !rawArgs[i + 1].startsWith("-")) {
      return ["--host"]
    }
    if (arg.startsWith("-h=")) return [`--host=${arg.slice(3)}`]
    return [arg]
  })
}
