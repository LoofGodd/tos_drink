/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button } from "~/components/ui/button"
// eslint-disable-next-line import/no-unresolved
import defaultUser from "/assets/images/user.jpg"
import Logo from "~/components/logo"
import {
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenu,
} from "~/components/ui/dropdown-menu"
import {
  LayoutDashboardIcon,
  Package2Icon,
  PackageIcon,
  ShoppingCartIcon,
  X,
} from "lucide-react"
import {
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { requireAdminRole, logout } from "~/lib/auth.server"
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@remix-run/node"
import { prisma } from "~/lib/db.server"
import { GeneralError } from "~/components/error-boundary"
import LinkSideBar from "~/components/dashboard/linkSidebar"
import { deleteAction } from "./admin+/product"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import { useState } from "react"
import { cn } from "~/lib/utils"
import LoadingNavigation from "~/components/loadingNavigation"

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdminRole(request)
  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true },
  })
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      image: { select: { id: true, altText: true } },
    },
  })
  const saleProducts = await prisma.cart.findMany({
    orderBy: { quantity: "desc" },
  })
  const userOrders = await prisma.userBoughtProduct.findMany({
    select: {
      id: true,
      productBoughtIdList: true,
      totalPrice: true,
      status: true,
      createdAt: true,
      user: { select: { username: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return json({ users, products, userOrders, saleProducts })
}
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const logoutAction = formData.get("logout")
  const deleteActionId = formData.get(deleteAction)
  if (logoutAction) return logout({ request })
  if (typeof deleteActionId === "string") {
    await prisma.product.delete({ where: { id: deleteActionId } })
  }
  return json({})
}
export default function AdminRoute() {
  const { userOrders, products } = useLoaderData<typeof loader>()
  const [showSidebar, setShowSidebar] = useState(true)
  const getProduct = (id: string) =>
    products.find((product) => product.id === id)
  const [searchParams, setSearchParams] = useSearchParams()
  const actionDeleteId = searchParams.get(deleteAction)
  const deleteDeleteAction = (deleteParams: Array<string> | string) => {
    if (typeof deleteParams === "string") {
      setSearchParams(
        (prev) => {
          prev.delete(deleteParams)
          return prev
        },
        { preventScrollReset: true }
      )
      return
    }
    if (deleteParams.length) {
      deleteParams.map((deleteParam) =>
        setSearchParams(
          (prev) => {
            prev.delete(deleteParam)
            return prev
          },
          { preventScrollReset: true }
        )
      )
    }
  }
  const fetcher = useFetcher()
  return (
    <div className="grid min-h-screen w-full overflow-hidden lg:grid-cols-[280px_1fr]">
      {actionDeleteId ? (
        <fetcher.Form
          preventScrollReset={true}
          method="post"
          className=" z-40 fixed bg-black/80 w-screen h-screen grid place-items-center"
          onClick={() => deleteDeleteAction(deleteAction)}
        >
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-fit px-8 py-4 rounded-2xl cursor-default"
          >
            <X
              className="w-4 h-4 ml-auto mt-2 my-6 cursor-pointer hover:text-green-500 transition-colors decoration-purple-200"
              onClick={() => deleteDeleteAction(deleteAction)}
            />
            <div>
              Are you sure you want to delete product name:{" "}
              <span>{getProduct(actionDeleteId)?.name}</span>
            </div>
            <button></button>
            <AuthenticityTokenInput />
            <input
              hidden
              name={deleteAction}
              value={getProduct(actionDeleteId)?.id}
            />
            <Button
              onClick={() => deleteDeleteAction(deleteAction)}
              type="submit"
              variant={"destructive"}
              className="ml-auto flex  mt-6 py-4"
            >
              Yes, Sure
            </Button>
          </button>
        </fetcher.Form>
      ) : null}

      <div
        className={cn(
          "hidden border-r bg-gray-100/40 dark:bg-gray-800/40",
          {
            "fixed block h-full z-40 bg-white": showSidebar,
          },
          "lg:block static"
        )}
      >
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center gap-x-8 border-b px-6">
            <Link className="flex items-center gap-2 font-semibold" to="#">
              <Logo className="!w-10" />
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start gap-y-8 px-4 text-sm font-medium">
              <LinkSideBar
                content="Dashboard"
                icon={<LayoutDashboardIcon className="h-4 w-4" />}
                to="dashboard"
              />
              <LinkSideBar
                content="Product"
                icon={<PackageIcon className="h-4 w-4" />}
                to="product"
              />

              <LinkSideBar
                content="order"
                icon={<ShoppingCartIcon className="h-4 w-4" />}
                to="order"
                notify={userOrders.reduce(
                  (sum, user) => (user.status === "pending" ? sum + 1 : sum),
                  0
                )}
              />
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
          <Button
            variant={"ghost"}
            className="lg:hidden"
            onClick={() => setShowSidebar((s) => !s)}
          >
            <Package2Icon className="h-6 w-6" />
            <span className="sr-only">Home</span>
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-lg">Admin Dashboard</h1>
          </div>
          <LoadingNavigation />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="rounded-full border border-gray-200 w-8 h-8 dark:border-gray-800"
                size="icon"
                variant="ghost"
              >
                <img
                  alt="Avatar"
                  className="rounded-full"
                  height="32"
                  src={defaultUser}
                  style={{
                    aspectRatio: "32/32",
                    objectFit: "cover",
                  }}
                  width="32"
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  fetcher.submit({ logout: "logout" }, { method: "POST" })
                }
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="h-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export const meta: MetaFunction = () => {
  return [{ title: "Admin | Dashboard" }]
}
export function ErrorBoundary() {
  return (
    <div className="h-screen w-screen grid place-items-center">
      <GeneralError />
    </div>
  )
}
