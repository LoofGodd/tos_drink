import { getErrorMessage } from "./utils"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(options: {
  to: Array<string> | string
  subject: string
  html?: string
  text: string
}) {
  const email = {
    from: "Bunnarot@gmail.com",
    ...options,
  }
  const { data, error } = await resend.emails.send({
    ...email,
  })
  if (error) {
    return { status: "error", message: getErrorMessage(error) }
  }
  return { status: "success", message: data }
}
