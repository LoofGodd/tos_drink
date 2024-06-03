import { remember } from "@epic-web/remember"
import { PrismaClient } from "@prisma/client"
import { createClient } from "@libsql/client"
import { PrismaLibSQL } from "@prisma/adapter-libsql"

const libSql = createClient({
  url: process.env.VITE_TURSO_DATABASE_URL,
  authToken: process.env.VITE_TURSO_AUTH_TOKEN,
})
const adapter = new PrismaLibSQL(libSql)
const prisma = remember("prisma", () => {
  const client = new PrismaClient({ adapter })
  client.$connect()
  return client
})

export { prisma }
