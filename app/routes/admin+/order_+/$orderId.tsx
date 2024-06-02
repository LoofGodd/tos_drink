import { Card, CardContent } from "~/components/ui/card"
import { LoaderFunctionArgs, json } from "@remix-run/node"
import { dollar, getProductImage, invariantResponse } from "~/lib/utils"
import { prisma } from "~/lib/db.server"
import { useLoaderData } from "@remix-run/react"
import Gradient from "~/components/gradient"

export async function loader({ params }: LoaderFunctionArgs) {
  invariantResponse(params.orderId, "Order Id is required")
  const orderId = params.orderId
  const order = await prisma.userBoughtProduct.findUnique({
    where: { id: orderId },
  })
  const carts = await prisma.cart.findMany()
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      image: { select: { id: true, altText: true } },
    },
  })
  return json({ order, products, carts })
}
export default function OrderId() {
  const { order, products, carts } = useLoaderData<typeof loader>()
  const productIdList = order?.productBoughtIdList.split(",")
  const cart = (id: string) => carts.find((cart) => cart.id === id)
  const product = (id: string) =>
    products.find((product) => cart(id)?.productId === product.id)
  return (
    <div className="py-8 px-16 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 place-items-center">
      {productIdList?.map((cartId) => (
        <Card key={cartId} className="w-full max-w-sm">
          <img
            alt="Product"
            className="aspect-square rounded-t-lg object-cover"
            height={400}
            src={getProductImage(product(cartId)?.image?.id)}
            width={400}
          />
          <CardContent className="p-4 space-y-2">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                <span>{product(cartId)?.name}</span> {"   "}x
                <span className="ml-8">{cart(cartId)?.quantity}</span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <Gradient
                  kuch={cart(cartId)!.kuch}
                  sugar={cart(cartId)!.sugar.toString()}
                  ice={cart(cartId)!.ice}
                  size={cart(cartId)!.size}
                />
              </p>
              <p className="text-xl font-semibold">
                {dollar(product(cartId)?.price)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
