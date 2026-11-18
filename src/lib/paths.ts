import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

const APP_DIR = path.join(os.homedir(), ".local", "share", "copilot-api")

export const githubTokenPath = (host: string) =>
  path.join(APP_DIR, `github_token.${host}`)

export const PATHS = {
  APP_DIR,
}

export async function ensurePaths(): Promise<void> {
  await fs.mkdir(PATHS.APP_DIR, { recursive: true })
}
