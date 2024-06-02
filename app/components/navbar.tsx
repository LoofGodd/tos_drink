import { Link, useNavigation } from "@remix-run/react"
import { cn } from "~/lib/utils"
import Logo from "./logo"
import { LogIn } from "lucide-react"
import { useOptionalUser } from "~/lib/user"
// eslint-disable-next-line import/no-unresolved
import LoadingNavigation from "./loadingNavigation"
export default function Navbar() {
  const user = useOptionalUser()
  const styleLink =
    "md:mx-2.5 inline-flex items-center pe-2 md:px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50"

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-6 mb-20 lg:flex justify-between py-3 md:items-center px-4 md:px-6">
      <div className="col-span-1  flex gap-x-8 items-center justify-center justify-self-start">
        <Logo />
        <LoadingNavigation />
      </div>
      <nav className="flex-1 flex items-center justify-around md:ml-10 row-start-2 col-span-2 lg:col-span-1">
        <Link className={styleLink} to="menu" prefetch="intent">
          Menu
        </Link>
        <Link className={styleLink} to="about">
          អំពីហាង
        </Link>
        <Link className={styleLink} to="feedback">
          FeedBack
        </Link>
      </nav>
      {user?.id ? (
        <Link to={`user/${user.username}`} className="flex gap-2 items-center">
          <img
            width={50}
            height={50}
            style={{
              aspectRatio: 1 / 1,
              objectFit: "cover",
            }}
            className="object-cover rounded-full"
            alt={user.image?.altText ?? "no image"}
            src={"/photo/user/0.jpg"}
          />
          <h1 className="text-lg font-semibold text-secondary-foreground">
            {user.username}
          </h1>
        </Link>
      ) : (
        <Link
          className={cn(styleLink, "col-start-2 flex justify-end")}
          to="/auth/login"
        >
          <p className="flex gap-x-1">
            Login <LogIn className="text-sm" />
          </p>
        </Link>
      )}
    </div>
  )
}
