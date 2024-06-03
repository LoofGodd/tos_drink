import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { z } from "zod"
import { combineHeaders } from "./utils"
import { createId as cuid2 } from "@paralleldrive/cuid2"

export const toastKey = "toastKey"
const toastSchema = z.object({
  title: z.string(),
  id: z.string().default(() => cuid2()),
  description: z.string().optional(),
  type: z.enum(["success", "error", "message"]).default("message"),
})
export type Toast = z.infer<typeof toastSchema>
export type ToastInput = z.input<typeof toastSchema>

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "cafe_toast",
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    secrets: process.env.VITE_SESSION_SECRET.split(","),
  },
})
export async function redirectWithToast(
  url: string,
  toast: ToastInput,
  init?: ResponseInit
) {
  return redirect(url, {
    ...init,
    headers: combineHeaders(init?.headers, await createToastHeaders(toast)),
  })
}
export async function createToastHeaders(toastInput: ToastInput) {
  const session = await toastSessionStorage.getSession()
  const toast = toastSchema.parse(toastInput)
  session.flash(toastKey, toast)
  const cookie = await toastSessionStorage.commitSession(session)
  return new Headers({ "set-cookie": cookie })
}

export async function getToasts(request: Request) {
  const session = await toastSessionStorage.getSession(
    request.headers.get("cookie")
  )
  const result = toastSchema.safeParse(session.get(toastKey))
  const toast = result.success ? result.data : null
  return {
    toast,
    headers: toast
      ? new Headers({
          "set-cookie": await toastSessionStorage.destroySession(session),
        })
      : null,
  }
}
