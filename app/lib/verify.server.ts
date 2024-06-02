import {
  VerifyFunctionAgs,
  targetQueryParam,
  typeQueryParam,
} from "~/routes/auth_+/verify"
import { verificationStorage } from "./verification.server"
import { verificationEmailKey } from "~/routes/auth_+/register"
import { redirect } from "@remix-run/node"
import { verificationResetPasswordKey } from "~/routes/auth_+/forget-password"
import { requireAnonymous } from "./auth.server"

export async function handleOnboardingVerification({
  request,
  submission,
}: VerifyFunctionAgs) {
  if (submission.status !== "success") {
    return
  }
  console.log("EMAIL VERIFICATION")
  const verificationSession = await verificationStorage.getSession(
    request.headers.get("cookie")
  )
  verificationSession.set(
    verificationEmailKey,
    submission.value[targetQueryParam]
  )
  return redirect(`/auth/${submission.value[typeQueryParam]}`, {
    headers: {
      "set-cookie": await verificationStorage.commitSession(
        verificationSession
      ),
    },
  })
}

export async function handleResetPasswordVerification({
  request,
  submission,
}: VerifyFunctionAgs) {
  if (submission.status !== "success") {
    return
  }
  const verificationSession = await verificationStorage.getSession(
    request.headers.get("cookie")
  )

  verificationSession.set(
    verificationResetPasswordKey,
    submission.value[targetQueryParam]
  )
  return redirect("/auth/new-password", {
    headers: {
      "Set-Cookie": await verificationStorage.commitSession(
        verificationSession
      ),
    },
  })
}
export async function requireResetPasswordCookie(request: Request) {
  await requireAnonymous(request)
  const verificationSession = await verificationStorage.getSession(
    request.headers.get("cookie")
  )
  const resetPasswordCookie = verificationSession.get(
    verificationResetPasswordKey
  )
  if (!resetPasswordCookie) throw redirect("/auth/login")
  return resetPasswordCookie
}
