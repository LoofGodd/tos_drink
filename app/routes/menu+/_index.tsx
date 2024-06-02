import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import NotFound from "~/components/not-found"
import SearchBar from "~/components/search-bar"
import { Card, CardHeader, CardContent } from "~/components/ui/card"
import { prisma } from "~/lib/db.server"
import { dollar } from "~/lib/utils"

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const search = url.searchParams.get("s") ?? ""
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: { select: { id: true } },
    },
    where: { name: { contains: search } },
  })
  return json({ products })
}

export default function Menu() {
  const { products } = useLoaderData<typeof loader>()
  if (!products.length) return <NotFound text="No Products was found" />
  return (
    <section className="pt-20">
      <div className="grid place-items-center mb-10">
        <h1 className="text-4xl font-bold">Get Your favorite drinks</h1>
        <p className="text-gray-400">Better day with better drinks</p>
      </div>
      <SearchBar className="w-fit flex gap-x-2 mx-auto mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 justify-center items-center w-[80%] mx-auto gap-x-10 gap-y-5 my-10">
        {products.length === 0
          ? null
          : products.map((product) => (
              <Card key={product.id} className="w-full">
                <CardHeader>
                  <img
                    alt="Product "
                    className="w-full h-auto"
                    height="300"
                    src={`/resources/product-image/${product.image?.id}`}
                    style={{
                      aspectRatio: "300/300",
                      objectFit: "cover",
                    }}
                    width="300"
                  />
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-bold">
                    <Link to={product.id} prefetch="intent">
                      {product.name}
                    </Link>{" "}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {dollar(product.price)}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>
    </section>
  )
}
export const meta: MetaFunction = () => {
  return [
    {
      title: "show now",
    },
    { name: "description", content: "Buy your favorite cafe" },
  ]
}
