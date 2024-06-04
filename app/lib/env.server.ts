import { z } from "zod"

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  DATABASE_PATH: z.string(),
  VITE_SESSION_SECRET: z.string(),
  VITE_TURSO_DATABASE_URL: z.string(),
  VITE_TURSO_AUTH_TOKEN: z.string(),
  VITE_EMAIL_USER: z.string(),
  VITE_APP_PASS: z.string(),
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}
export function init() {
  const parsed = schema.safeParse(process.env)

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    )

    throw new Error("Invalid envirmonment variables")
  }
}

export function getEnv() {
  return {
    MODE: process.env.NODE_ENV,
    MOCK_API: process.env.MOCK_API,
  }
}
type ENV = ReturnType<typeof getEnv>

declare global {
  // eslint-disable-next-line no-var
  var ENV: ENV
  interface window {
    ENV: ENV
  }
}
