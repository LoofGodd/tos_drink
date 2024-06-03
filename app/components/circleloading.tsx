import { useNavigation } from "@remix-run/react"
import { cn } from "~/lib/utils"

interface CircleProps {
  className?: string
}
export default function CircleLoading({ className }: CircleProps) {
  const navigation = useNavigation()
  return (
    <>
      {navigation.state === "loading" || navigation.state === "submitting" ? (
        <div
          className={cn(
            "w-6 h-6 rounded-full border-l-2 border-t-2  border-dotted animate-spin border-red-600",
            className
          )}
        ></div>
      ) : null}
    </>
  )
}
