import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import { completionRoutes } from "./routes/chat-completions/route"
import { dashboardHtml } from "./routes/dashboard"
import { decisionsRoutes } from "./routes/decisions/route"
import { embeddingRoutes } from "./routes/embeddings/route"
import { messageRoutes } from "./routes/messages/route"
import { modelRoutes } from "./routes/models/route"
import { openapiRoute } from "./routes/openapi/route"
import { responsesRoutes } from "./routes/responses/route"
import { tokenRoute } from "./routes/token/route"
import { usageRoute } from "./routes/usage/route"

export const server = new Hono()

server.use(logger())
server.use(cors())

server.get("/", (c) => c.text("Server running"))
server.get("/dashboard", (c) => {
  return c.html(dashboardHtml)
})

server.route("/chat/completions", completionRoutes)
server.route("/models", modelRoutes)
server.route("/embeddings", embeddingRoutes)
server.route("/responses", responsesRoutes)
server.route("/decisions", decisionsRoutes)
server.route("/usage", usageRoute)
server.route("/token", tokenRoute)
server.route("/openapi.yaml", openapiRoute)

// Compatibility with tools that expect v1/ prefix
server.route("/v1/chat/completions", completionRoutes)
server.route("/v1/models", modelRoutes)
server.route("/v1/embeddings", embeddingRoutes)
server.route("/v1/responses", responsesRoutes)
server.route("/v1/decisions", decisionsRoutes)

// Anthropic compatible endpoints
server.route("/v1/messages", messageRoutes)
