import { redirect } from "@remix-run/node"
import bcrypt from "bcryptjs"
import { sessionStorage } from "./session.server"
import { prisma } from "./db.server"
import { createPassword } from "./db-utils"

export interface User {
  username: string
  name?: string
  email: string
  password: string
}
export const sessionKey = "sessionId"
export const ExpirationTime = 30 * 24 * 60 * 60 * 100
export const getExpirationTime = () => {
  return new Date(Date.now() + ExpirationTime)
}
export async function getSessionId(request: Request) {
  const sessionCookie = await sessionStorage.getSession(
    request.headers.get("cookie")
  )
  return sessionCookie.get(sessionKey)
}
export async function getUserId(request: Request) {
  const sessionId = await getSessionId(request)
  if (!sessionId) return null
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { userId: true },
  })
  if (!session) throw await logout({ request })
  return session.userId
}

export async function logout({ request }: { request: Request }) {
  const sessionCookie = await sessionStorage.getSession(
    request.headers.get("cookie")
  )
  const sessionId = sessionCookie.get(sessionKey)
  void prisma.session.delete({
    where: { id: sessionId },
  })
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(sessionCookie),
    },
  })
}

export async function signup(user: User) {
  const userSignedUp = await prisma.session.create({
    data: {
      expired: getExpirationTime(),
      user: {
        create: {
          username: user.username,
          email: user.email,
          name: user.name,
          password: { create: createPassword(user.password) },
        },
      },
    },
    select: { id: true, user: { select: { username: true } } },
  })
  return userSignedUp
}

export async function login({
  username,
  password,
}: {
  username: string
  password: string
}) {
  const user = await verifyUserPassword(username, password)
  if (!user) return null
  const session = await prisma.session.create({
    data: {
      expired: getExpirationTime(),
      userId: user.id,
    },
    select: {
      id: true,
      userId: true,
    },
  })
  return session
}

export async function verifyUserPassword(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      password: { select: { hash: true } },
    },
  })

  if (!user || !user.password?.hash) {
    return null
  }
  const isValid = await bcrypt.compare(password, user.password?.hash)
  if (!isValid) return null
  return user
}

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {}
) {
  const userId = await getUserId(request)
  if (!userId) {
    const url = new URL(request.url)
    redirectTo =
      redirectTo === null
        ? redirectTo
        : redirectTo ?? `${url.pathname}${url.search}`
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null
    const login = ["/auth/login", loginParams?.toString()].join("?")
    throw redirect(login)
  }
  return userId
}
export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request)
  if (userId) throw redirect("/")
  return null
}
export async function requireAdminRole(request: Request) {
  const userId = await requireUserId(request)
  const admin = await prisma.user.findUnique({
    where: { id: userId, AND: { role: "admin" } },
    select: { id: true, username: true },
  })
  if (!admin) throw redirect("/")
  return admin
}
