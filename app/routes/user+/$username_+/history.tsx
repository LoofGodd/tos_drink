import { MetaFunction, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { LoaderFunctionArgs } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { requireUserId } from "~/lib/auth.server"
import { prisma } from "~/lib/db.server"
import { cn, convertKhmerDate, dollar, getProductImage } from "~/lib/utils"

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  })
  const productUserBoughtWrap = await prisma.userBoughtProduct.findMany({
    where: { userId: userId },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      productBoughtIdList: true,
      status: true,
      id: true,
      totalPrice: true,
      createdAt: true,
      user: { select: { username: true } },
    },
  })
  const products = await Promise.all(
    productUserBoughtWrap.map((productIdList) =>
      Promise.all(
        productIdList.productBoughtIdList.split(",").map(async (productId) => {
          const cartProduct = await prisma.cart.findUnique({
            where: { id: productId },
            select: {
              id: true,
              kuch: true,
              ice: true,
              size: true,
              sugar: true,
              status: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  price: true,
                  image: { select: { id: true, altText: true } },
                },
              },
            },
          })
          return cartProduct
        })
      )
    )
  )

  return json({
    productsBought: productUserBoughtWrap,
    productList: products,
    username: user?.username,
  })
}
export default function HistoryUserRoute() {
  const { productsBought, productList } = useLoaderData<typeof loader>()
  return (
    <div className="w-full mt-12">
      {productsBought.map((product, index) => (
        <div
          key={product.id}
          className={cn(
            "border-4 mx-8 my-4 grid grid-cols-5  md:flex-row items-center rounded-md",
            product.status === "paid"
              ? "border-green-500 "
              : product.status === "shipped"
              ? "border-sky-500"
              : "border-amber-400"
          )}
        >
          <div className="flex flex-col gap-y-4 m-2 col-start-1 col-span-4">
            {productList[index].map((product) => (
              <Card
                key={product?.product.id}
                className="flex flex-col lg:flex-row gap-4 items-center justify-between"
              >
                <CardHeader>
                  <img
                    alt={product?.product.image?.altText ?? "noImage"}
                    className="w-[7rem] rounded-md"
                    src={getProductImage(product?.product.image?.id)}
                    style={{
                      aspectRatio: "1/1",
                      objectFit: "cover",
                    }}
                  />
                </CardHeader>
                <CardContent className="flex items-center justify-between p-0 gap-x-5 justify-self-start basis-1/2">
                  <CardTitle className="text-sm lg:text-lg">
                    {product?.product.name}
                  </CardTitle>
                  <ul className="grid grid-cols-3 gird-rows-4 text-gray-500 text-xs lg:text-sm w-full text-center basis-1/2">
                    <li className="row-start-1 col-start-1 col-span-1">
                      Kuch:
                    </li>
                    <li className="col-span-2">{product?.kuch}</li>
                    <li className="row-start-2 col-start-1 col-span-1">
                      Sugar:
                    </li>
                    <li className="col-span-2">{product?.sugar}</li>
                    <li className="row-start-3 col-start-1 col-span-1">Ice:</li>
                    <li className="col-span-2">{product?.ice}</li>
                    <li className="row-start-4 col-start-1 col-span-1">
                      Size:
                    </li>
                    <li className="col-span-2">{product?.size}</li>
                  </ul>
                  <div className="text-center">
                    <h1 className="text-md font-semibold">quantity</h1>
                    <p className="text-gray-500">{product?.quantity}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <h1 className="font-semibold text-lg">
                    {dollar(product?.product.price)}
                  </h1>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div
            className={cn(
              "text-center mr-2 uppercase font-semibold text-xl",
              product.status === "pending"
                ? "text-yellow-500"
                : product.status === "paid"
                ? "text-green-400"
                : "text-sky-400"
            )}
          >
            <p>{product.status}</p>
          </div>
          {product.status === "pending" ? (
            <div className="col-span-5 px-4 flex justify-between items-center gap-y-4 py-3">
              <p className="text-gray-400 text-sm">
                {convertKhmerDate(new Date(product.createdAt), {
                  d: true,
                  m: true,
                  y: true,
                  t: true,
                })}
              </p>
              <div className="text-center flex flex-col gap-y-4 px-5 py-2 border-2 rounded-sm">
                <h1>
                  total Price:
                  {dollar(product.totalPrice)}
                </h1>
                <Button asChild>
                  <Link
                    to={`/user/${product.user.username}/product/${product.id}`}
                  >
                    Paid now
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export const meta: MetaFunction<
  null,
  { "routes/user+/$username_+/history": typeof loader }
> = ({ matches }) => {
  const productMatch = matches.find(
    (m) => m.id === "routes/user+/$username_+/history"
  )
  const username = productMatch?.data?.username
  const totalToPay = productMatch?.data.productsBought.length
  const productName = productMatch?.data.productList.map((productL) =>
    productL.map((p) => p?.product.name)
  )
  return [
    {
      title: `History | ${username} `,
    },
    {
      name: "description",
      content: `View history user name: ${username} have bought sofar total Items: ${totalToPay} and listProduct Id: ${productName} `,
    },
  ]
}
