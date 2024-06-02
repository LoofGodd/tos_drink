import { useRouteLoaderData } from "@remix-run/react"
import { loader as rootLoader } from "~/root"
import { invariantResponse } from "./utils"

export function useOptionalUser() {
  const data = useRouteLoaderData<typeof rootLoader>("root")
  return data?.user ?? null
}
export function useUser() {
  const mayUser = useOptionalUser()
  invariantResponse(mayUser, "User not found. use userOptionalUser Instead")
  return mayUser
}
