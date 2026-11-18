import type { Context } from "hono"

import consola from "consola"

import { awaitApproval } from "~/lib/approval"
import { checkRateLimit } from "~/lib/rate-limit"
import { state } from "~/lib/state"
import {
  forwardToCopilot,
  modelSupportsEndpoint,
} from "~/services/copilot/passthrough"

interface ResponsesPayload {
  model?: string
  stream?: boolean
  input?: unknown
}

export async function handleResponses(c: Context) {
  await checkRateLimit(state)

  const rawBody = await c.req.text()
  const payload = JSON.parse(rawBody) as ResponsesPayload
  consola.debug("Responses request model:", payload.model)

  if (state.models && !modelSupportsEndpoint(payload.model, "/responses")) {
    return c.json(
      {
        error: {
          message: `Model ${payload.model} does not support the Responses API`,
          type: "invalid_request_error",
        },
      },
      400,
    )
  }

  if (state.manualApprove) await awaitApproval()

  return await forwardToCopilot(c, "/responses", rawBody)
}
