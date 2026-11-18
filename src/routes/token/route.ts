import { Hono } from "hono"

import { state } from "~/lib/state"

export const tokenRoute = new Hono()

tokenRoute.get("/", (c) => {
  if (!state.showToken) {
    return c.json(
      {
        error:
          "Token endpoint is disabled. Start with --show-token to enable it.",
      },
      403,
    )
  }

  try {
    return c.json({
      token: state.copilotToken,
    })
  } catch (error) {
    console.error("Error fetching token:", error)
    return c.json({ error: "Failed to fetch token", token: null }, 500)
  }
})
