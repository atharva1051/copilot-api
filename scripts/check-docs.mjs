import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
/** @param {string} path */
const read = (path) => readFileSync(join(root, path), "utf8")
const problems = []

try {
  execFileSync("node", ["scripts/sync-openapi.mjs", "--check"], {
    cwd: root,
    stdio: "pipe",
  })
} catch (error) {
  problems.push(String(error.stderr || error.message).trim())
}

const endpointsDoc = read("docs/endpoints.md")
const openapiDoc = read("docs/openapi.yaml")
const operationsDoc = read("docs/operations.md")

const server = read("src/server.ts")
const routePaths = new Set(
  [...server.matchAll(/server\.(?:route|get)\("([^"]+)"/g)].map((m) => m[1]),
)
for (const path of routePaths) {
  const canonical = path
  const variants = [
    canonical,
    canonical.replace(/^\/v1/, ""),
    `/v1${canonical}`,
  ]
  const inEndpoints = variants.some((v) => endpointsDoc.includes("`" + v + "`"))
  const inOpenapi = variants.some((v) => openapiDoc.includes(`  ${v}:`))
  if (!inEndpoints)
    problems.push(`docs/endpoints.md does not mention route ${path}`)
  if (!inOpenapi)
    problems.push(`docs/openapi.yaml does not define route ${path}`)
}

for (const file of readdirSync(join(root, "src/routes"), { recursive: true })) {
  if (!String(file).endsWith("route.ts")) continue
  const text = read(join("src/routes", String(file)))
  for (const m of text.matchAll(/Routes?\.(?:get|post)\("(\/[^"]+)"/g)) {
    const sub = m[1]
    if (!endpointsDoc.includes(sub))
      problems.push(
        `docs/endpoints.md does not mention sub-route ${sub} (${String(file)})`,
      )
    if (!openapiDoc.includes(sub))
      problems.push(
        `docs/openapi.yaml does not define sub-route ${sub} (${String(file)})`,
      )
  }
}

for (const file of ["src/start.ts", "src/auth.ts"]) {
  const text = read(file)
  const argsBlock = text.slice(text.indexOf("args: {"))
  for (const m of argsBlock.matchAll(/^ {4}"?([a-z][a-z-]*)"?: \{/gm)) {
    if (!operationsDoc.includes(`--${m[1]}`)) {
      problems.push(
        `docs/operations.md does not document flag --${m[1]} (${file})`,
      )
    }
  }
}

const main = read("src/main.ts")
const sub = main.match(/subCommands: \{([^}]+)\}/)
if (sub) {
  for (const name of sub[1]
    .split(",")
    .map((s) => s.trim().replaceAll(/^"|"(?=:)|:.*$/g, ""))
    .filter(Boolean)) {
    if (!operationsDoc.includes("`" + name + "`"))
      problems.push(`docs/operations.md does not document command ${name}`)
  }
}

for (const file of readdirSync(join(root, "docs")).filter((f) =>
  f.endsWith(".md"),
)) {
  const text = read(join("docs", file))
  for (const m of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
    const target = m[1]
    if (/^(?:https?:|mailto:)/.test(target)) continue
    if (!existsSync(join(root, "docs", target)))
      problems.push(`docs/${file} links to missing file ${target}`)
  }
}

if (problems.length > 0) {
  console.error("Docs are out of date:\n- " + problems.join("\n- "))
  process.exit(1)
}
console.log("docs are up to date")
