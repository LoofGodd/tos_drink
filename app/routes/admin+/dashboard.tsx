import { useRouteLoaderData } from "@remix-run/react"
import CardDash from "~/components/dashboard/CardDash"
import {
  cn,
  convertKhmerDate,
  dollar,
  getProductImage,
  shortString,
} from "~/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table"
import { loader as parentLoader } from "../admin"
import { Banknote, Boxes, SendToBack, UsersIcon, Wallet } from "lucide-react"

export default function AdminDashRoute() {
  const { users, products, saleProducts, userOrders } =
    useRouteLoaderData<typeof parentLoader>("routes/admin")!
  const saleProductsClean: typeof saleProducts = []
  let skip = false
  for (let j = 0; j < saleProducts.length; j++) {
    for (let i = 0; i < saleProductsClean.length; i++) {
      if (saleProducts[j].productId === saleProductsClean[i].productId) {
        saleProductsClean[i].quantity += saleProducts[j].quantity
        skip = true
      }
    }
    if (!skip) {
      saleProductsClean.push(saleProducts[j])
    }
    skip = false
  }
  saleProductsClean.sort((a, b) => a.quantity + b.quantity)
  const getProduct = (id: string) =>
    products.find((product) => product.id === id)
  return (
    <main className="flex-1 grid gap-6 p-6 md:p-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <CardDash
          heading="Total Users"
          content={users.length}
          icon={
            <UsersIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          }
        />
        <CardDash
          heading="Total Products"
          content={products.length}
          icon={<Boxes className="h-6 w-6 text-gray-500 dark:text-gray-400" />}
        />
        <CardDash
          heading="Total Orders"
          content={saleProducts.reduce(
            (totalSale, saleProduct) => totalSale + saleProduct.quantity,
            0
          )}
          icon={
            <SendToBack className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          }
        />
        <CardDash
          heading="Revenue Processing"
          content={dollar(
            userOrders.reduce(
              (totalPrice, userOrder) =>
                userOrder.status === "pending"
                  ? totalPrice + userOrder.totalPrice
                  : totalPrice,
              0
            )
          )}
          icon={<Wallet className="h-6 w-6 text-gray-500 dark:text-gray-400" />}
        />

        <CardDash
          heading="Revenue"
          content={dollar(
            userOrders.reduce(
              (totalPrice, userOrder) =>
                userOrder.status === "paid"
                  ? totalPrice + userOrder.totalPrice
                  : totalPrice,
              0
            )
          )}
          icon={
            <Banknote className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          }
        />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userOrders.length
                  ? Array.from(
                      {
                        length: userOrders.length > 5 ? 5 : userOrders.length,
                      },
                      (_, index) => (
                        <TableRow key={userOrders[index]?.id}>
                          <TableCell className="font-medium">
                            {shortString(userOrders[index]?.id, 3)}
                          </TableCell>
                          <TableCell>
                            {userOrders[index].user.username}
                          </TableCell>
                          <TableCell>
                            {convertKhmerDate(
                              new Date(userOrders[index].createdAt),
                              {
                                d: true,
                                m: true,
                                y: true,
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            {dollar(userOrders[index].totalPrice)}
                          </TableCell>
                          <TableCell
                            className={cn({
                              "text-yellow-600":
                                userOrders[index].status === "pending",

                              "text-green-600":
                                userOrders[index].status === "paid",
                              "text-blue-600":
                                userOrders[index].status === "shipped",
                            })}
                          >
                            {userOrders[index].status}
                          </TableCell>
                        </TableRow>
                      )
                    )
                  : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saleProductsClean.length ? (
                  Array.from(
                    {
                      length:
                        saleProductsClean.length > 5
                          ? 5
                          : saleProductsClean.length,
                    },
                    (_, index) => {
                      return (
                        <TableRow key={saleProductsClean[index].id}>
                          <TableCell className="font-medium">
                            <img
                              className="object-covert"
                              width={70}
                              height={70}
                              style={{
                                aspectRatio: 1 / 1,
                                objectFit: "cover",
                              }}
                              src={getProductImage(
                                getProduct(saleProductsClean[index].productId)
                                  ?.image?.id
                              )}
                              alt="las"
                            />
                          </TableCell>
                          <TableCell>
                            {
                              getProduct(saleProductsClean[index].productId)
                                ?.name
                            }
                          </TableCell>
                          <TableCell>
                            {saleProductsClean[index].quantity}
                          </TableCell>
                        </TableRow>
                      )
                    }
                  )
                ) : (
                  <div>No order</div>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
