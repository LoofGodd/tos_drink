import { X } from "lucide-react"
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./ui/card"
import { Input } from "./ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Product } from "~/routes/menu+/$productId"
import { dollar, getProductImage, shortString } from "~/lib/utils"
import { useFetcher, useSearchParams } from "@remix-run/react"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import { useState } from "react"
export interface ProductBought {
  product: Product
  id: string
  sugar: number
  kuch: string
  ice: string
  size: string
  status: string
  quantity: number
}
interface ItemBoughtProps {
  item: ProductBought
}
const deleteCartAction = "deleteCartId"
export const cartDeleteIdAction = "cartDeleteId"
export const itemBoughtQuantity = "itemBoughtQuantity"
export const cartQuantityIdAction = "cartQuantityIdAction"
export default function ItemBought({ item }: ItemBoughtProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const handleDeleteQueryParams = (deleteParams: Array<string> | string) => {
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
  const handleAddParam = (name: string, value: string) => {
    setSearchParams(
      (prev) => {
        prev.set(name, value)
        return prev
      },
      { preventScrollReset: true }
    )
  }
  const fetcher = useFetcher()
  const dialogOpen = searchParams.get(deleteCartAction) === item.id
  return (
    <Card className="md:grid flex flex-col relative grid-cols-5 grid-rows-1 items-center justify-between hover:shadow-md hover:shadow-red-100 transition-all duration-200">
      <CardHeader className="col-start-1 col-span-1 h-fit  mb-5 md:mb-0">
        <img
          alt="Product "
          className="w-[10rem] rounded-2xl"
          src={getProductImage(item.product.image?.id)}
          style={{
            aspectRatio: "1/1",
            objectFit: "cover",
          }}
        />
      </CardHeader>
      <CardContent className="col-span-2 col-start-2 h-full flex justify-center md:justify-between items-center gap-y-5 gap-x-8 w-full ">
        <div className="flex flex-col gap-y-3">
          <CardTitle>{item.product.name}</CardTitle>
          {item.product.description ? (
            <CardDescription>
              {shortString(item.product.description, 70)}
            </CardDescription>
          ) : null}
        </div>
        <ul className="grid grid-cols-3 gird-rows-4 items-start text-gray-500 text-sm w-full">
          <li className="row-start-1 col-start-1 col-span-1">Kuch</li>
          <li className="col-span-2">:{item.kuch}</li>
          <li className="row-start-2 col-start-1 col-span-1">Sugar</li>
          <li className="col-span-2">:{item.sugar}</li>
          <li className="row-start-3 col-start-1 col-span-1">Ice</li>
          <li className="col-span-2">:{item.ice}</li>
          <li className="row-start-4 col-start-1 col-span-1">Size</li>
          <li className="col-span-2">:{item.size}</li>
        </ul>
      </CardContent>
      <CardFooter className="h-full col-start-4 col-span-2 flex flex-col gap-y-5 md:flex-row justify-around items-center px-10">
        <div className="flex items-center gap-4">
          <label className="text-sm shrink-0" htmlFor="quantity-3">
            Quantity
          </label>
          <fetcher.Form
            method="post"
            onChange={(e) => {
              fetcher.submit(e.currentTarget, {
                method: "post",
                preventScrollReset: true,
              })
            }}
          >
            <AuthenticityTokenInput />
            <input name={cartQuantityIdAction} defaultValue={item.id} hidden />
            <Input
              className="w-16 input input-sm"
              name={itemBoughtQuantity}
              min="1"
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value !== "" ? e.target.value : "1")
              }
            />
          </fetcher.Form>
        </div>
        <p className="text-2xl font-semibold">{dollar(item.product.price)}</p>
      </CardFooter>
      <div className="absolute top-1 right-3 hover:text-red-500 transition-all duration-100">
        <Dialog
          open={dialogOpen}
          onOpenChange={() =>
            dialogOpen
              ? handleDeleteQueryParams(deleteCartAction)
              : handleAddParam(deleteCartAction, item.id)
          }
        >
          <DialogTrigger
            onClick={() => handleAddParam(deleteCartAction, item.id)}
          >
            <X />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader
              onClick={() => handleDeleteQueryParams(deleteCartAction)}
            >
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                <p className="mb-5">
                  The product {item.product.name} will be removed from the cart.
                </p>
                <div className="flex gap-x-3">
                  <fetcher.Form method="post">
                    <AuthenticityTokenInput />
                    <input
                      name={cartDeleteIdAction}
                      defaultValue={item.id}
                      hidden
                    />

                    <Button variant="destructive" type="submit">
                      yes
                    </Button>
                  </fetcher.Form>

                  <DialogTrigger
                    onClick={() => handleDeleteQueryParams(deleteCartAction)}
                  >
                    <Button variant="secondary">Cancel</Button>
                  </DialogTrigger>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}
