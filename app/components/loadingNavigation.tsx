import { useNavigation } from "@remix-run/react"

export default function LoadingNavigation() {
  const navigation = useNavigation()
  return (
    <>
      {navigation.state === "loading" || navigation.state === "submitting" ? (
        <div className="border-black grid place-items-center w-screen h-screen animate-pulse bg-black/30 fixed top-0 left-0 z-30">
          <div className="border-white border-dotted border-l-6 border-t-8 border-b-6 w-[10vw] h-[10vw] animate-spin rounded-full z-50"></div>
        </div>
      ) : null}
    </>
  )
}
