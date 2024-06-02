import { useNavigation } from "@remix-run/react"

export default function LoadingNavigation() {
  const navigation = useNavigation()
  return (
    <>
      {navigation.state === "loading" || navigation.state === "submitting" ? (
        <div className="border-black w-6 h-6 rounded-full border-2 border-dotted animate-spin"></div>
      ) : null}
    </>
  )
}
