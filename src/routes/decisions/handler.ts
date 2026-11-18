import type { Context } from "hono"

import consola from "consola"

import { awaitApproval } from "~/lib/approval"
import { checkRateLimit } from "~/lib/rate-limit"
import { state } from "~/lib/state"
import {
  forwardToCopilot,
  modelSupportsEndpoint,
} from "~/services/copilot/passthrough"

const ENDPOINT = "/v1/decisions"

interface DecisionsPayload {
  model?: string
  [key: string]: unknown
}

const resolveDecisionsModel = (model: string | undefined) => {
  if (!model || modelSupportsEndpoint(model, ENDPOINT)) return model
  const copilotId = `${model}-decisions`
  return modelSupportsEndpoint(copilotId, ENDPOINT) ? copilotId : model
}

export async function handleDecisions(c: Context) {
  await checkRateLimit(state)

  const payload = await c.req.json<DecisionsPayload>()
  const model = resolveDecisionsModel(payload.model)
  consola.debug("Decisions request model:", payload.model, "->", model)

  if (state.models && !modelSupportsEndpoint(model, ENDPOINT)) {
    return c.json(
      {
        error: {
          message: `Model ${payload.model} does not support the Decisions API`,
          type: "invalid_request_error",
        },
      },
      400,
    )
  }

  if (state.manualApprove) await awaitApproval()

  return await forwardToCopilot(
    c,
    ENDPOINT,
    JSON.stringify({ ...payload, model }),
  )
}
