import { ActionFunctionArgs, MetaFunction, json } from "@remix-run/node"
import { Form, useLoaderData, useFetcher } from "@remix-run/react"
import { LogOutIcon, ShieldAlert, Tablet, UserRoundCog } from "lucide-react"
import { LoaderFunctionArgs } from "react-router"
import { Link } from "react-router-dom"
import { GeneralError } from "~/components/error-boundary"
import { Button } from "~/components/ui/button"
import { getSessionId, logout, requireUserId } from "~/lib/auth.server"
import { convertKhmerDate, dollar } from "~/lib/utils"
import { prisma } from "~/lib/db.server"
import { useState } from "react"

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true,
      role: true,
      carts: {
        select: {
          product: { select: { price: true } },
          quantity: true,
          status: true,
        },
      },
      image: {
        select: { id: true, blob: true, altText: true, contentType: true },
      },
    },
  })
  const totalSession = await prisma.session.count({
    where: { userId: userId, expired: { gt: new Date(Date.now()) } },
  })
  return json({ user, totalSession })
}
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  if (formData.get("logout")) return await logout({ request })
  const userId = formData.get("deleteSession")
  if (typeof userId === "string") {
    const sessionId = await getSessionId(request)
    await prisma.session.deleteMany({
      where: { id: { not: sessionId }, userId },
    })
  }
  return json({})
}

export default function ProfileRoute() {
  const { user, totalSession } = useLoaderData<typeof loader>()
  const [showDeleteSession, setShowDeleteSession] = useState<
    "close" | "show" | "delete"
  >("close")
  const fetcher = useFetcher()
  const join = convertKhmerDate(new Date(user!.createdAt), {
    d: true,
    m: true,
    y: true,
  })
  return (
    <section className="grid place-items-center py-10 px-4 h-full w-full">
      <div className="grid grid-rows-2 grid-cols-2 w-full md:w-3/4 bg-secondary py-4">
        <div className="flex flex-col gap-y-2 items-center col-start-1 col-span-1">
          <figure className="flex flex-col gap-x-2 items-center">
            <img
              src={"/photo/user/0.jpg"}
              alt="yes"
              className="rounded-full object-cover w-[100px] md:w-[150px]"
              style={{ aspectRatio: 1 / 1, objectFit: "cover" }}
            />
            <figcaption className="text-4xl font-semibold">
              {user?.name ? user.name : user?.username}
            </figcaption>
          </figure>
          <p>{join}</p>
          {user?.role === "admin" ? (
            <Link
              to="/admin"
              className="flex gap-x-4 hover:bg-secondary-foreground/80 transition-colors duration-300 bg-secondary-foreground/90 text-secondary px-4 py-2 rounded-lg"
            >
              Admin <UserRoundCog />
            </Link>
          ) : null}
        </div>
        <div className="col-start-2 col-span-1 grid place-items-center">
          <ul className="flex flex-col items-center">
            <li>
              Spend:{" "}
              {dollar(
                user?.carts.reduce(
                  (acc, cur) => cur.product.price * cur.quantity + acc,
                  0
                )
              )}
            </li>
            <li>
              Unique item:{" "}
              {user?.carts.filter((cart) => cart.status === "hide").length}
            </li>
            <li>
              <Button asChild variant={"link"}>
                <Link to="history">Products History</Link>
              </Button>
            </li>
          </ul>
        </div>
        <div className="flex items-center justify-center col-start-1 col-span-2">
          <Form method="POST">
            <Button variant="link">
              <input hidden name="logout" defaultValue="logout" />
              Logout
              <LogOutIcon />
            </Button>
          </Form>
        </div>
        <div>
          {showDeleteSession !== "close" ? (
            <fetcher.Form
              method="POST"
              className="fixed  top-0 left-0 bg-black/70 w-full h-full grid place-items-center"
              onClick={() => setShowDeleteSession("close")}
            >
              <Button
                type="submit"
                name="deleteSession"
                value={user?.id}
                variant={"destructive"}
                onClick={() => {
                  fetcher.submit(
                    { deleteSession: user!.id },
                    { method: "POST" }
                  )
                }}
              >
                Are you sure you want to delete? click
                <ShieldAlert />
              </Button>
            </fetcher.Form>
          ) : null}
          <Button onClick={() => setShowDeleteSession("show")}>
            There are another {totalSession} sessions <Tablet />
          </Button>
        </div>
      </div>
    </section>
  )
}
export const meta: MetaFunction = ({ params }) => {
  return [{ title: `Cafe | ${params.username}` }]
}
export function ErrorBoundary() {
  return <GeneralError />
}
