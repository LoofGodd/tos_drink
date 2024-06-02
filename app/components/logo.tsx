import { Link } from "@remix-run/react"
import { cn } from "~/lib/utils"

export default function Logo({ className }: { className?: string }) {
  return (
    <Link className="flex items-center font-semibold tracking-wider" to="/">
      <img
        alt="Product "
        className={cn("w-12 md:w-14 lg:w-16", className)}
        src="/photo/logo.png"
        style={{
          aspectRatio: "1/1",
          objectFit: "cover",
        }}
      />
      <span>Cafe Pu Sok</span>
    </Link>
  )
}
