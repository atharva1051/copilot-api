import { expect, test } from "bun:test"

import { resolveHost, rewriteHostFlag } from "../src/lib/host"

test("github.com", () => {
  for (const input of ["github.com", "https://github.com/", "GitHub.com"]) {
    const r = resolveHost(input)
    expect(r.kind).toBe("dotcom")
    expect(r.webUrl).toBe("https://github.com")
    expect(r.apiUrl).toBe("https://api.github.com")
    expect(r.copilotApiUrl).toBeUndefined()
  }
})

test("ghe.com", () => {
  const r = resolveHost("https://company.ghe.com/some/path")
  expect(r.kind).toBe("ghec")
  expect(r.host).toBe("company.ghe.com")
  expect(r.apiUrl).toBe("https://api.company.ghe.com")
  expect(r.copilotApiUrl).toBe("https://copilot-api.company.ghe.com")
})

test("ghes", () => {
  const r = resolveHost("git.corp.example.com")
  expect(r.kind).toBe("ghes")
  expect(r.webUrl).toBe("https://git.corp.example.com")
  expect(r.apiUrl).toBe("https://git.corp.example.com/api/v3")
  expect(r.copilotApiUrl).toBe("https://copilot-api.git.corp.example.com")
})

test("empty host throws", () => {
  expect(() => resolveHost("  ")).toThrow()
})

test("-h rewrite", () => {
  expect(rewriteHostFlag(["start", "-h", "x.ghe.com"])).toEqual([
    "start",
    "--host",
    "x.ghe.com",
  ])
  expect(rewriteHostFlag(["-h"])).toEqual(["-h"])
  expect(rewriteHostFlag(["-h", "--verbose"])).toEqual(["-h", "--verbose"])
})
