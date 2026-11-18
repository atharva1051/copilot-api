import type { Context } from "hono"

import { copilotBaseUrl, copilotHeaders } from "~/lib/api-config"
import { HTTPError } from "~/lib/error"
import { state } from "~/lib/state"

const FORWARDED_HEADERS = ["anthropic-version", "anthropic-beta"]

export const modelSupportsEndpoint = (
  modelId: string | undefined,
  endpoint: string,
) =>
  Boolean(
    modelId
      && state.models?.data
        .find((model) => model.id === modelId)
        ?.supported_endpoints?.includes(endpoint),
  )

export const hasAgentTurn = (items: unknown): boolean => {
  if (!Array.isArray(items)) return false
  return items.some(
    (item: { role?: string; type?: string; content?: unknown }) => {
      if (item.role === "assistant" || item.role === "tool") return true
      if (
        item.type === "function_call_output"
        || item.type === "function_call"
      ) {
        return true
      }
      return (
        Array.isArray(item.content)
        && item.content.some(
          (part: { type?: string }) => part.type === "tool_result",
        )
      )
    },
  )
}

export const forwardToCopilot = async (
  c: Context,
  endpoint: string,
  rawBody: string,
) => {
  const payload = JSON.parse(rawBody) as {
    stream?: boolean
    messages?: unknown
    input?: unknown
  }
  if (!state.copilotToken) throw new Error("Copilot token not found")

  const headers: Record<string, string> = {
    ...copilotHeaders(state),
    "X-Initiator":
      hasAgentTurn(payload.messages) || hasAgentTurn(payload.input) ?
        "agent"
      : "user",
  }
  for (const name of FORWARDED_HEADERS) {
    const value = c.req.header(name)
    if (value) headers[name] = value
  }

  const response = await fetch(`${copilotBaseUrl(state)}${endpoint}`, {
    method: "POST",
    headers,
    body: rawBody,
  })

  if (!response.ok) {
    throw new HTTPError(`Failed to call Copilot ${endpoint}`, response)
  }

  const contentType = response.headers.get("content-type") ?? "application/json"
  const responseHeaders = new Headers({ "content-type": contentType })
  if (payload.stream) {
    responseHeaders.set("cache-control", "no-cache")
    responseHeaders.set("x-accel-buffering", "no")
  }
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}

export const unsupportedEndpointHint = (
  modelId: string | undefined,
  endpoint: string,
) => {
  const supported = state.models?.data.find(
    (model) => model.id === modelId,
  )?.supported_endpoints
  if (!supported || supported.length === 0 || supported.includes(endpoint)) {
    return undefined
  }
  const usable = supported.filter((item) => !item.startsWith("ws:"))
  return `Model ${modelId} does not support ${endpoint}. Supported endpoints: ${usable.join(", ")}`
}
