import config from "@echristian/eslint-config"

export default config({
  ignores: ["src/routes/openapi/spec.ts"],
  prettier: {
    plugins: ["prettier-plugin-packagejson"],
  },
})
