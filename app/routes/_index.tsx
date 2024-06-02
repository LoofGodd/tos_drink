import { LoaderFunctionArgs, json, type MetaFunction } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { ShoppingCart } from "lucide-react"
import { GeneralError } from "~/components/error-boundary"
import FeatureProducts from "~/components/feature_products"
import Hero from "~/components/hero"
import { Button } from "~/components/ui/button"
import { getUserId } from "~/lib/auth.server"
import { prisma } from "~/lib/db.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = (await getUserId(request)) ?? ""
  const productsFeature = await prisma.product.findMany({
    where: { feature: true },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: { select: { id: true, altText: true } },
    },
  })
  const totalCarts = await prisma.cart.count({
    where: {
      userId,
      status: "show",
    },
  })
  return json({ productsFeature, totalCarts })
}
export const meta: MetaFunction = () => {
  return [
    { title: "Cafe Market" },
    { name: "description", content: "Welcome to Remix!" },
  ]
}

export default function Index() {
  const { productsFeature, totalCarts } = useLoaderData<typeof loader>()
  return (
    <div>
      <Hero />
      <FeatureProducts products={productsFeature} />
      <Button asChild variant={"link"} className="fixed bottom-10 right-10">
        <Link to="/cart" className="">
          <ShoppingCart size={50} />{" "}
          {totalCarts ? (
            <span className="absolute -top-2 right-4 px-2 py-1 rounded-full text-white bg-black">
              {totalCarts}
            </span>
          ) : null}
        </Link>
      </Button>
    </div>
  )
}
export function ErrorBoundary() {
  return <GeneralError />
}
