import { LoaderFunctionArgs, MetaFunction, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { CheckIcon, CopyCheck, CopyIcon, DownloadIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { requireUserId } from "~/lib/auth.server"
import { prisma } from "~/lib/db.server"
import { dollar, invariantResponse } from "~/lib/utils"

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUserId(request)
  invariantResponse(params.productBoughtId, "Your recipe id is required")
  const productBought = await prisma.userBoughtProduct.findUnique({
    where: { id: params.productBoughtId },
    select: { id: true, totalPrice: true },
  })
  return json({ product: productBought })
}
export default function ProductBoughtIdRoute() {
  const { product } = useLoaderData<typeof loader>()
  const [copy, setCopy] = useState<boolean>(false)
  useEffect(() => {
    setTimeout(() => {
      setCopy(false)
    }, 80000)
  }, [copy])
  if (!product) return <div>No Receipt Id was found</div>

  return (
    <div className="bg-secondary py-14 px-6">
      <div className="flex items-center justify-center gap-x-4 text-center my-12">
        <h1 className="text-2xl font-semibold uppercase underline">Note:</h1>
        <p className="text-lg font-medium">
          If you have already paid, and see this, because we have not confirmed
          yet.
        </p>
      </div>
      <div className="w-2/3 mx-auto my-9">
        <figure className="flex gap-x-9">
          <div className="flex flex-col gap-y-3">
            <img src="/photo/aba.png" alt="aba qr" className="w-[20rem]" />
            <input name="download-image" defaultValue={"download"} hidden />
            <Button asChild>
              <Link
                to="/resources/downloadABAImage"
                className="flex gap-x-2 w-full"
                reloadDocument
              >
                <h1>Download Image</h1>
                <DownloadIcon />
              </Link>
            </Button>
          </div>
          <figcaption>
            <div className="flex flex-col gap-y-4 mb-4">
              <div className="flex items-center gap-y-4">
                <h1>
                  id: <span className="font-bold">{product.id}</span>
                </h1>
                <Button
                  variant={"ghost"}
                  className="text-black"
                  onClick={async () => {
                    await navigator.clipboard.writeText(product.id)
                    setCopy(true)
                  }}
                >
                  {copy ? <CopyCheck /> : <CopyIcon />}
                </Button>
                {copy ? (
                  <div className="flex text-green-500">
                    <CheckIcon /> <p>copied</p>
                  </div>
                ) : null}
              </div>
              <h1>owner: ChornDy Bunnarot</h1>
              <h1 className="font-semibold">
                total Price: {dollar(product.totalPrice)}
              </h1>
            </div>
            <div>
              <h1 className="font-bold text-lg text-red-700">
                To pay, you have to copy the id below and past as description to
                make sure you have paid for this product,
              </h1>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  )
}
export const meta: MetaFunction<
  null,
  { "routes/user+/$username_+/product.$productBoughtId": typeof loader }
> = ({ matches }) => {
  const productMatch = matches.find(
    (m) => m.id === "routes/user+/$username_+/product.$productBoughtId"
  )
  const paymentId = productMatch?.data.product?.id
  const totalPrice = productMatch?.data.product?.totalPrice
  return [
    {
      title: `Pay now | Total Price: ${dollar(totalPrice)} `,
    },
    {
      name: "description",
      content: `View pay the product package with paymentID: ${paymentId} and total Price: ${totalPrice}`,
    },
  ]
}
