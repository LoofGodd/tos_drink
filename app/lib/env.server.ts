import { z } from "zod"

const schema = z.object({
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  SESSION_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  MOCK_API: z.string(),
  TURSO_DATABASE_URL: z.string(),
  TURSO_AUTH_TOKEN: z.string(),
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
