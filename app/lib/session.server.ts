import { createCookieSessionStorage } from "@remix-run/node"

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "cafe_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    secrets: process.env.VITE_SESSION_SECRET.split(","),
  },
})
