import { faker } from "@faker-js/faker"
import { HttpResponse, http, type HttpHandler } from "msw"
import { z } from "zod"

const emailSchema = z.object({
  from: z.string().optional(),
  to: z.string(),
  subject: z.string(),
  html: z.string().optional(),
  text: z.string(),
})
export const handler: Array<HttpHandler> = [
  http.post("https://api.resend.com/emails", async ({ request }) => {
    const body = emailSchema.parse(await request.json())
    return HttpResponse.json({
      id: faker.string.uuid(),
      from: body?.from,
      to: body?.to,
      text: body.text,
      createdAt: new Date(Date.now()),
    })
  }),
]
