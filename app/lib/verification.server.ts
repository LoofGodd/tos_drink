import { createCookieSessionStorage } from "@remix-run/node"

export const verificationStorage = createCookieSessionStorage({
  cookie: {
    name: "cafe_verification",
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    secrets: process.env.SESSION_SECRET.split(","),
    secure: process.env.NODE_ENV === "production",
  },
})
