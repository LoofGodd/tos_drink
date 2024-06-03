import { renderAsync } from "@react-email/render"
import nodemailer from "nodemailer"
import { ReactElement } from "react"

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASS,
  },
})
export async function sendEmail({
  react,
  ...options
}: {
  to: string
  subject: string
} & (
  | { html: string; text: string; react?: never }
  | { react: ReactElement; html?: never; text?: never }
)) {
  const from = { name: "Cafe Pu Sok", address: "narot752@gmail.com" }

  const email = {
    from,
    ...options,
    ...(react ? await renderReactEmail(react) : null),
  }

  const info = await transporter.sendMail(email)

  return { status: "success", message: info }
}
async function renderReactEmail(react: ReactElement) {
  const [html, text] = await Promise.all([
    renderAsync(react),
    renderAsync(react, { plainText: true }),
  ])
  return { html, text }
}
