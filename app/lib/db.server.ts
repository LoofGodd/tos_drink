import { remember } from "@epic-web/remember"
import { PrismaClient } from "@prisma/client"

const prisma = remember("prisma", () => {
  const client = new PrismaClient()
  client.$connect()
  return client
})

export { prisma }
