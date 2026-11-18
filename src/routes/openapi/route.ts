import { Hono } from "hono"

import { openapiYaml } from "./spec"

export const openapiRoute = new Hono()

openapiRoute.get("/", (c) =>
  c.body(openapiYaml, 200, {
    "content-type": "application/yaml; charset=utf-8",
  }),
)
