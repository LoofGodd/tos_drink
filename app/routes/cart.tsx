/**
 * v0 by Vercel.
 * @see https://v0.dev/t/Rmm2YaNn1cl
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Button } from "~/components/ui/button"
import ItemBought, { ProductBought } from "~/components/itemBought"
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react"
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@remix-run/node"
import { requireUserId } from "~/lib/auth.server"
import { prisma } from "~/lib/db.server"
import { dollar } from "~/lib/utils"
import { validateCSRF } from "~/lib/csrf.server"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import { useUser } from "~/lib/user"
import { z } from "zod"
import { parseWithZod } from "@conform-to/zod"
import { redirectWithToast } from "~/lib/toast.server"

const deleteItemSchema = z.object({
  cartDeleteId: z.string(),
})
const updateItemQuantitySchema = z.object({
  cartQuantityIdAction: z.string(),
  itemBoughtQuantity: z.string(),
})
const checkoutSchema = z.object({
  userId: z.string(),
  productList: z.string(),
  totalPrice: z.string(),
})

const cartUniquePrisma = {
  userId: true,
  productId: true,
  sugar: true,
  kuch: true,
  ice: true,
  size: true,
}

const getCart = async (id: string) => {
  const cart = await prisma.cart.findUnique({
    where: { id },
    select: { ...cartUniquePrisma, quantity: true, id: true },
  })
  return cart
}

const cartUnique = async (id: string) => {
  const cart = await getCart(id)
  if (!cart) return null
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { quantity, ...newCart } = cart
  const unique = await prisma.cart.findFirst({
    where: {
      ...newCart,
      sugar: Number(cart.sugar),
      status: { in: ["hide", "show"] },
      id: { not: newCart.id },
    },

    select: { id: true, quantity: true },
  })
  return unique
}
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request)
  const productBought = await prisma.cart.findMany({
    where: { userId, status: "show" },
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

  return json({ products: productBought }, { status: 200 })
}
export async function action({ request }: ActionFunctionArgs) {
  await requireUserId(request)
  const formData = await request.formData()
  validateCSRF(formData, request.headers)
  //delete Item
  await parseWithZod(formData, {
    schema: deleteItemSchema.transform(async (data) => {
      await prisma.cart.delete({ where: { id: data.cartDeleteId } })
    }),
    async: true,
  })
  //update quantity
  await parseWithZod(formData, {
    schema: updateItemQuantitySchema.transform(async (data) => {
      await prisma.cart.update({
        where: { id: data.cartQuantityIdAction },
        data: {
          quantity: Number(data.itemBoughtQuantity)
            ? Number(data.itemBoughtQuantity)
            : 1,
        },
      })
    }),
    async: true,
  })

  //update checkout
  const checkedOutSubmission = await parseWithZod(formData, {
    schema: checkoutSchema.transform(async (data) => {
      const productIdList = data.productList.split(",") // Split with comma separator

      await prisma.userBoughtProduct.upsert({
        where: {
          id: data.userId,
          productBoughtIdList: { in: productIdList },
        },
        create: {
          userId: data.userId,
          productBoughtIdList: data.productList,
          status: "pending",
          totalPrice: Number(data.totalPrice),
        },
        update: {
          status: "pending", // Update existing entries to "pending" if needed
        },
      })

      // Update cart items efficiently using batch update
      const cartUpdates = await Promise.all(
        productIdList.map(async (productBoughtId) => {
          const unique = await cartUnique(productBoughtId)
          const oldCart = await getCart(productBoughtId)

          if (!unique) {
            return {
              where: { id: productBoughtId },
              data: { status: "hide" },
            }
          }

          await prisma.cart.update({
            where: { id: productBoughtId },
            data: { status: productBoughtId },
          })
          return {
            where: { id: unique.id },
            data: {
              quantity: Number(oldCart?.quantity) + unique.quantity,
            },
          }
        })
      )
      for (const cartUpdate of cartUpdates) {
        await prisma.cart.update({
          where: cartUpdate.where,
          data: cartUpdate.data,
        })
      }
      return { data }
    }),
    async: true,
  })

  if (checkedOutSubmission.status === "success") {
    return redirectWithToast("/", {
      title: "Thank you for ordering",
      description: "To get you product make you sure you pay first",
      type: "success",
    })
  }
  return json({ totalPrice: 100 })
}
export default function Cart() {
  const { products: carts } = useLoaderData<typeof loader>()
  const totalPrice = carts.reduce(
    (acc, cur) => cur.quantity * cur.product.price + acc,
    0
  )
  return (
    <div className="bg-gray-100 dark:bg-gray-85  w-full md:mx-10">
      <div className="container py-6 ">
        <Heading />
        {carts.length ? (
          <>
            <div>
              <div className="flex gap-y-3 flex-col">
                {carts.map((product) => (
                  <ItemBought key={product.id} item={product} />
                ))}
              </div>
            </div>
            <div className="mt-6">
              <Calculation totalPrice={totalPrice} totalItems={carts} />
            </div>
          </>
        ) : (
          <p className="text-black/80 text-4xl font-semibold text-center my-10">
            No Items yet
          </p>
        )}
      </div>
    </div>
  )
}

function Heading() {
  return (
    <div className="flex flex-col md:flex-row justify-center text-center items-center gap-6 px-4 md:px-6 my-4">
      <div className="grid gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Review items in your cart before checkout
        </p>
      </div>
      <Link
        className="flex items-center gap-2 text-sm underline shrink-0 ml-auto"
        to="/menu"
      >
        <svg
          aria-hidden="true"
          fill="currentColor"
          height="20"
          viewBox="0 0 20 20"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M10 0C4.477 0 0 4.477 0 10c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10 0-5.523-4.477-10-10-10zm4.688 10.313H5.312v-1.875h9.375v1.875zm-7.5-3.75h7.5v1.875h-7.5V6.563z"
            fillRule="evenodd"
          />
        </svg>

        <p>Continue Shopping</p>
      </Link>
    </div>
  )
}
function Calculation({
  totalPrice,
  totalItems,
}: {
  totalPrice: number
  totalItems: ProductBought[]
}) {
  const user = useUser()
  const navigation = useNavigation()

  const productList = totalItems.map((totalItem) => totalItem.id).join(",")
  return (
    <div className="grid gap-4 md:gap-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row  items-center gap-4 md:gap-8">
        <div className="grid gap-1.5">
          <h2 className="font-semibold text-lg md:text-xl">
            Subtotal ({totalItems.length} items)
          </h2>
        </div>
        <div className="md:ml-auto grid gap-1.5">
          <h3 className="font-semibold text-lg md:text-xl">
            total:{dollar(totalPrice)}
          </h3>
          <Form method="post">
            <AuthenticityTokenInput />
            <input
              name="userId"
              value={user.id}
              defaultValue={user.id}
              hidden
            />
            <input
              name="productList"
              value={productList}
              defaultValue={productList}
              hidden
            />
            <input
              name="totalPrice"
              value={totalPrice}
              defaultValue={totalPrice}
              hidden
            />
            <Button
              size="lg"
              type="submit"
              disabled={
                navigation.state === "loading" ||
                navigation.state === "submitting"
              }
            >
              Checkout
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}

export const meta: MetaFunction<null, { "routes/cart": typeof loader }> = ({
  matches,
}) => {
  const productMatch = matches.find((m) => m.id === "routes/cart")
  const productDescription = productMatch?.data.products
    .map(
      (p) =>
        `${p.product.name} ${p.product.description} ${p.product.price} ${p.kuch} ${p.ice} ${p.size} ${p.sugar} ${p.quantity}`
    )
    .join(" - ")

  return [
    {
      title: `Cafe | Product In your Cart`,
    },
    {
      name: "description",
      content: `Total Product: ${productMatch?.data.products.length} and product description: ${productDescription}`,
    },
  ]
}
