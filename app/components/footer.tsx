import { Link } from "@remix-run/react"
import Logo from "./logo"
export default function Footer() {
  return (
    <footer className="w-full py-6 border-t text-sm/relaxed font-medium tracking-wide text-center lg:text-base/relaxed dark:text-gray-400 row-span-1">
      <div className="container flex flex-col gap-2 items-center justify-center px-4 md:gap-4 md:flex-row md:px-6">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <nav className="flex items-center justify-center flex-1 min-w-0 gap-4">
          <Link
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            to="/"
          >
            Home
          </Link>
          <Link
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            to="/menu"
          >
            Shop
          </Link>
          <Link
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            to="/about"
          >
            About
          </Link>
        </nav>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-gray-500 dark:text-gray-400">
            Mon - Fri: 9AM - 6PM
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-gray-500 dark:text-gray-400">
            © 2023 Acme Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
