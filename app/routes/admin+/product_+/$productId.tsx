import { LoaderFunctionArgs, json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import NotFound from "~/components/not-found"
import { prisma } from "~/lib/db.server"
import { dollar, getProductImage, invariantResponse } from "~/lib/utils"

export async function loader({ params }: LoaderFunctionArgs) {
  invariantResponse(params.productId, "Product id is required")
  const productId = params.productId
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      name: true,
      price: true,
      description: true,
      image: { select: { id: true, altText: true } },
    },
  })
  return json({ product })
}

export default function ProductDetailRoute() {
  const { product } = useLoaderData<typeof loader>()
  if (!product) return <NotFound text="No Product was found" />
  return (
    <div className="grid md:grid-cols-2 gap-6 lg:gap-12 items-start max-w-6xl px-4 mx-auto py-6">
      <div className="grid gap-4">
        <div className="grid gap-4">
          <img
            alt={product.image?.altText ?? ""}
            className="aspect-square object-cover border border-gray-200 w-full rounded-lg overflow-hidden dark:border-gray-800"
            height={600}
            src={getProductImage(product.image?.id)}
            width={600}
          />
        </div>
      </div>
      <div className="grid gap-4 md:gap-10 items-start">
        <div className="flex flex-col gap-y-10 justify-between gap-4">
          <h1 className="font-bold text-3xl lg:text-4xl">{product.name}</h1>
          <div className="text-4xl font-bold">{dollar(product.price)}</div>
          <div className="text-sm leading-loose text-gray-500 dark:text-gray-400">
            <p>{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
