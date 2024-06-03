import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node"
import * as React from "react"
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useRouteLoaderData,
} from "@remix-run/react"
import tailwindStyleSheetUrl from "./styles/tailwind.css?url"
import fontStyleSheetUrl from "./styles/fonts.css?url"
import Navbar from "./components/navbar"
import Footer from "./components/footer"
import { getEnv } from "./lib/env.server"
import { prisma } from "./lib/db.server"
import { csrf } from "./lib/csrf.server"
import { AuthenticityTokenProvider } from "remix-utils/csrf/react"
import { GeneralError } from "./components/error-boundary"
import { Toaster } from "./components/ui/toaster"
import { getToasts } from "./lib/toast.server"
import { combineHeaders } from "./lib/utils"
import { getUserId } from "./lib/auth.server"

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStyleSheetUrl },
    { rel: "stylesheet", href: fontStyleSheetUrl },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken(request)
  const { toast, headers: toastHeaders } = await getToasts(request)
  const userId = (await getUserId(request)) ?? ""
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      role: true,
      image: { select: { id: true, altText: true } },
    },
  })
  return json(
    { ENV: getEnv(), user, csrfToken, toast },
    {
      headers: combineHeaders(
        csrfCookieHeader ? { "set-cookie": csrfCookieHeader } : null,
        toastHeaders
      ),
    }
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root")
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data?.ENV)}`,
          }}
        />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const data = useRouteLoaderData<typeof loader>("root")!
  const { pathname } = useLocation()
  return (
    <AuthenticityTokenProvider token={data.csrfToken}>
      {pathname.includes("/admin") ? (
        <Outlet />
      ) : (
        <Document>
          <Outlet />
          <Toaster toasts={[data.toast]} />
        </Document>
      )}
      <Toaster toasts={[data.toast]} />
    </AuthenticityTokenProvider>
  )
}

function Document({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-rows-[150px_1fr_100px] lg:grid-rows-[100px_1fr_100px]">
      <header>
        <Navbar />
      </header>
      <main className="grid place-items-center">{children}</main>
      <Footer />
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralError />
    </Document>
  )
}
