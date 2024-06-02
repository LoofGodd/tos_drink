import { parseWithZod } from "@conform-to/zod"
import {
  ActionFunctionArgs,
  MetaFunction,
  json,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { ZodIssueCode, z } from "zod"
import ProductDetail, { productDetailSchema } from "~/components/productdetail"
import { requireUserId } from "~/lib/auth.server"
import { prisma } from "~/lib/db.server"
import { dollar, invariantResponse } from "~/lib/utils"

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image: { id: string; altText: string | null } | null
}
export async function loader({ params }: LoaderFunctionArgs) {
  invariantResponse(params.productId, "404")
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: { select: { id: true, altText: true } },
    },
  })
  return json({ product })
}
export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const submission = await parseWithZod(formData, {
    schema: () =>
      productDetailSchema.transform(async (data, ctx) => {
        const productId = formData.get("productId")
        if (typeof productId !== "string") {
          ctx.addIssue({
            code: ZodIssueCode.custom,
            message: "There is not product selected",
          })
          return z.NEVER
        }
        const userBoughtThrProduct = await prisma.cart.findUnique({
          where: {
            cafe_tmey: {
              userId,
              productId,
              ...data,
            },
          },
          select: { id: true, quantity: true },
        })
        let productBought
        if (!userBoughtThrProduct) {
          productBought = await prisma.cart.create({
            data: { userId: userId, productId, ...data, quantity: 1 },
            select: { id: true },
          })
        } else {
          productBought = await prisma.cart.update({
            where: {
              cafe_tmey: {
                userId: userId,
                productId,
                ...data,
              },
            },
            data: { quantity: userBoughtThrProduct.quantity + 1 },
            select: { id: true },
          })
        }
        return { ...data, ...productBought }
      }),
    async: true,
  })
  if (submission.status !== "success") {
    return json(submission.reply(), { status: 400 })
  }
  return redirect("/cart")
}
export default function ProductId() {
  const { product } = useLoaderData<typeof loader>()
  return (
    <div>
      <ProductDetail product={product} />
    </div>
  )
}
export const meta: MetaFunction<
  null,
  { "routes/menu+/$productId": typeof loader }
> = ({ matches }) => {
  const productMatch = matches.find((m) => m.id === "routes/menu+/$productId")

  return [
    { title: "Cafe | Buy it now" },
    {
      name: "description",
      content: `Checking Product name: ${
        productMatch?.data.product?.name
      } with price: ${dollar(
        productMatch?.data.product?.price
      )} and description ${productMatch?.data.product?.description}`,
    },
  ]
}
