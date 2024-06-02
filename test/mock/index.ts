import { setupServer } from "msw/node"
import { handler } from "./resend"

export const server = setupServer(...handler)

console.log("MOCKKKED")
server.listen({ onUnhandledRequest: "bypass" })
