import type { ModelsResponse } from "~/services/copilot/get-models"

export interface State {
  githubToken?: string
  copilotToken?: string
  copilotApiBaseUrl?: string

  githubHost: string
  githubBaseUrl: string
  githubApiBaseUrl: string
  copilotFallbackUrl?: string

  accountType: string
  models?: ModelsResponse
  vsCodeVersion?: string

  manualApprove: boolean
  rateLimitWait: boolean
  showToken: boolean

  // Rate limiting configuration
  rateLimitSeconds?: number
  lastRequestTimestamp?: number
}

export const state: State = {
  githubHost: "github.com",
  githubBaseUrl: "https://github.com",
  githubApiBaseUrl: "https://api.github.com",
  accountType: "individual",
  manualApprove: false,
  rateLimitWait: false,
  showToken: false,
}
