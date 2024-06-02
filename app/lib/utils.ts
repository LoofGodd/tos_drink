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
