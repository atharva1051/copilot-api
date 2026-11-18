#!/usr/bin/env node

import { defineCommand } from "citty"
import consola from "consola"

import { applyHost, hostArg } from "./lib/host"
import { ensurePaths, githubTokenPath } from "./lib/paths"
import { state } from "./lib/state"
import { setupGitHubToken } from "./lib/token"

interface RunAuthOptions {
  host?: string
  verbose: boolean
  showToken: boolean
}

export async function runAuth(options: RunAuthOptions): Promise<void> {
  if (options.verbose) {
    consola.level = 5
    consola.info("Verbose logging enabled")
  }

  const { host } = applyHost(options.host)
  consola.info(`Using GitHub host ${host}`)
  state.showToken = options.showToken

  await ensurePaths()
  await setupGitHubToken({ force: true })
  consola.success("GitHub token written to", githubTokenPath(host))
}

export const auth = defineCommand({
  meta: {
    name: "auth",
    description: "Run GitHub auth flow without running the server",
  },
  args: {
    ...hostArg,
    verbose: {
      alias: "v",
      type: "boolean",
      default: false,
      description: "Enable verbose logging",
    },
    "show-token": {
      type: "boolean",
      default: false,
      description: "Show GitHub token on auth",
    },
  },
  run({ args }) {
    return runAuth({
      host: args.host,
      verbose: args.verbose,
      showToken: args["show-token"],
    })
  },
})
