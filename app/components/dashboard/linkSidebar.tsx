import { Link, useLocation } from "@remix-run/react"
import { ReactNode } from "react"
import { cn } from "~/lib/utils"

interface NavLinkProps {
  content: string
  icon?: ReactNode
  to: string
  notify?: number
}
export default function NavLinkDash({
  content,
  icon,
  to,
  notify,
}: NavLinkProps) {
  const url = useLocation()
  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50 dark:hover:text-gray-50",
        { "bg-gray-100": url.pathname.includes(to) }
      )}
      to={to}
    >
      {icon ? icon : null}
      {content}{" "}
      {notify ? (
        <span className="bg-black/90 px-1 rounded-lg text-white">{notify}</span>
      ) : null}
    </Link>
  )
}
