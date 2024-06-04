import { vitePlugin as remix } from "@remix-run/dev"
import { installGlobals } from "@remix-run/node"
import { flatRoutes } from "remix-flat-routes"
import { defineConfig, loadEnv } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

installGlobals()

const variables = [
  "NODE_ENV",
  "VITE_SESSION_SECRET",
  "VITE_TURSO_DATABASE_URL",
  "VITE_TURSO_AUTH_TOKEN",
  "VITE_EMAIL_USER",
  "VITE_APP_PASS",
]

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const processEnv: { [key: string]: string } = {}
  variables.map((key) => (processEnv[key] = env[key]))
  return {
    define: {
      "process.env": processEnv,
    },
    plugins: [
      remix({
        ignoredRouteFiles: ["**/.*"],
        routes: async (defineRoutes) => {
          return flatRoutes("routes", defineRoutes)
        },
      }),
      tsconfigPaths(),
    ],
  }
})
