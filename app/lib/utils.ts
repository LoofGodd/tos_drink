import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createPassword } from "./db-utils"
import { useSearchParams } from "@remix-run/react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function invariantResponse(
  condition: unknown,
  message: string | (() => string),
  responseInit?: ResponseInit
): asserts condition {
  if (!condition) {
    throw new Response(typeof message === "function" ? message() : message, {
      status: 404,
      ...responseInit,
    })
  }
}
export function dollar(money: number | undefined) {
  if (!money) return 0 + "$"
  const moneyS = money.toString()
  const readableMoneyNumber = 3
  const isManyMoney = moneyS.length / readableMoneyNumber
  const reminder = moneyS.length % readableMoneyNumber
  let newMoney = ""
  if (!isManyMoney || moneyS.length <= readableMoneyNumber) return moneyS + "$"

  for (let index = 0; index < moneyS.length; index++) {
    if (index === reminder && reminder !== 0) {
      newMoney += ","
      newMoney += moneyS[index]
    } else if (index % (readableMoneyNumber + reminder) === 0 && index !== 0) {
      newMoney += ","
      newMoney += moneyS[index]
    } else {
      newMoney += moneyS[index]
    }
  }
  return newMoney + "$"
}
export function hash(password: string) {
  return createPassword(password).hash
}
export function getErrorMessage(error: unknown) {
  if (typeof error === "string") return error
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  )
    return error.message
  console.log("Unable to get error message for error", error)
  return "Unknown Error"
}
export function getProductImage(productId = "none") {
  return `/resources/product-image/${productId}`
}
export function getUserImage(userId = "none") {
  return `/resources/user-image/${userId}`
}
export function shortString(text: string, length = 50) {
  if (!text) return text
  if (text.length < length) return text
  return text.substring(0, length) + "..."
}
export function combineHeaders(
  ...headers: Array<ResponseInit["headers"] | null>
) {
  const combine = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      combine.append(key, value)
    }
  }
  return combine
}

export function convertKhmerDate(
  date: Date,
  options: { [key: string]: boolean } = { d: true, m: true, y: true, t: true }
) {
  const khmerMonthNames = [
    "មករា",
    "កុម្ភៈ",
    "មិនា",
    "មេសា",
    "ឧសភា",
    "មិថុនា",
    "កក្កដា",
    "សីហា",
    "កញ្ញា",
    "តុលា",
    "វិច្ឆិកា",
    "ធ្នូ",
  ]
  const dateAtt: { [key: string]: string } = {
    d: date.getDate().toString(),
    m: khmerMonthNames[date.getMonth()],
    y: date.getFullYear().toString(),
    t: date.toLocaleTimeString("km-Kh"),
  }
  // Format the date components
  const format = Object.entries(options)
    .filter(([key]) => options[key])
    .map(([key]) => {
      if (dateAtt[key]) return dateAtt[key]
    })
  return format.join(" - ")
}
export function getDomainUrl(request: Request) {
  const host =
    request.headers.get("X-Forwarded-Host") ?? request.headers.get("host")
  if (!host) {
    throw new Error("Could not determine domain URL.")
  }
  const protocol = host.includes("localhost") ? "http" : "https"
  return `${protocol}://${host}`
}
export const html = () => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" lang="en">

      <head>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" />
      </head>
      <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Your login code for Cafe Pu Sok<div>‌‍‎​‏﻿</div>
      </div>

      <body style="background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,&quot;Segoe UI&quot;,Roboto,Oxygen-Sans,Ubuntu,Cantarell,&quot;Helvetica Neue&quot;,sans-serif">
        <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:560px;margin:0 auto;padding:20px 0 48px">
          <tbody>
            <tr style="width:100%">
              <td><img alt="Linear" height="42" src="https://react-email-demo-7qy8spwep-resend.vercel.app/static/linear-logo.png" style="display:block;outline:none;border:none;text-decoration:none;border-radius:21px;width:42px;height:42px" width="42" />
                <h1 style="font-size:24px;letter-spacing:-0.5px;line-height:1.3;font-weight:400;color:#484848;padding:17px 0 0">Your login code for Linear</h1>
                <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="padding:27px 0 27px">
                  <tbody>
                    <tr>
                      <td><a href="https://linear.app" style="line-height:100%;text-decoration:none;display:block;max-width:100%;background-color:#5e6ad2;border-radius:3px;font-weight:600;color:#fff;font-size:15px;text-align:center;padding:11px 23px 11px 23px" target="_blank"><span><!--[if mso]><i style="letter-spacing: 23px;mso-font-width:-100%;mso-text-raise:16.5" hidden>&nbsp;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:8.25px">Login to Linear</span><span><!--[if mso]><i style="letter-spacing: 23px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]--></span></a></td>
                    </tr>
                  </tbody>
                </table>
                <p style="font-size:15px;line-height:1.4;margin:0 0 15px;color:#3c4149">This link and code will only be valid for the next 5 minutes. If the link does not work, you can use the login verification code directly:</p><code style="font-family:monospace;font-weight:700;padding:1px 4px;background-color:#dfe1e4;letter-spacing:-0.3px;font-size:21px;border-radius:4px;color:#3c4149">tt226-5398x</code>
                <hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#dfe1e4;margin:42px 0 26px" /><a href="https://linear.app" style="color:#b4becc;text-decoration:none;font-size:14px" target="_blank">Linear</a>
              </td>
            </tr>
          </tbody>
        </table>
      </body>

    </html>`
}
