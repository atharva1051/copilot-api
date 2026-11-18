import { dashboardBody } from "./dashboard/body"
import { dashboardScript } from "./dashboard/client"
import { dashboardStyles } from "./dashboard/styles"

export const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Copilot API</title>
  <style>${dashboardStyles}</style>
</head>
<body>
${dashboardBody}
  <script>${dashboardScript}</script>
</body>
</html>`
