import { json, useFetcher, useLoaderData, useNavigate } from "@remix-run/react"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table"
import { convertKhmerDate, dollar, shortString } from "~/lib/utils"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { prisma } from "~/lib/db.server"
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import { ActionFunctionArgs } from "@remix-run/node"
import { z } from "zod"
import { parseWithZod } from "@conform-to/zod"

const statusSchema = z.object({
  status: z.enum(["pending", "paid", "shipped"]),
  orderedId: z.string(),
})

export async function loader() {
  const userOrders = await prisma.userBoughtProduct.findMany({
    select: {
      id: true,
      productBoughtIdList: true,
      totalPrice: true,
      status: true,
      createdAt: true,
      user: { select: { username: true } },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  return json({ userOrders })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const statusSubmission = parseWithZod(formData, { schema: statusSchema })
  if (statusSubmission.status === "success") {
    const { orderedId, status } = statusSubmission.value
    await prisma.userBoughtProduct.update({
      where: { id: orderedId },
      data: {
        status,
      },
    })
  }
  return json({})
}
export default function OrderAdminRoute() {
  const { userOrders } = useLoaderData<typeof loader>()
  const navigate = useNavigate()
  const fetcher = useFetcher()
  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Ordered</h1>
      </div>
      <ScrollArea className="overflow-x-auto w-[440px] sm:w-[600px] md:w-[700px] lg:w-[700px] xl:w-full">
        <Table className="overflow-x-scroll">
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userOrders.map((order) => (
              <TableRow
                key={order.id}
                className="cursor-pointer"
                onClick={() => navigate(`${order.id}`)}
              >
                <TableCell>{shortString(order.id, 10)}</TableCell>
                <TableCell>{order.user.username}</TableCell>
                <TableCell>
                  {shortString(order.productBoughtIdList, 8)}
                </TableCell>
                <TableCell>{dollar(order.totalPrice)}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={order.status}
                    onValueChange={(e) =>
                      fetcher.submit(
                        {
                          status: e,
                          orderedId: order.id,
                        },
                        { method: "POST" }
                      )
                    }
                  >
                    <SelectTrigger
                      className={`${
                        order.status === "pending"
                          ? "text-yellow-600 border-yellow-500 bg-yellow-50"
                          : order.status === "paid"
                          ? "text-green-600 border-green-500 bg-green-50"
                          : "text-blue-600 border-blue-500 bg-blue-50"
                      } w-[180px]`}
                    >
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="uppercase">
                        <SelectLabel>Status</SelectLabel>
                        <SelectItem value="pending" className="text-yellow-500">
                          PENDING
                        </SelectItem>
                        <SelectItem value="paid" className="text-green-500">
                          PAID
                        </SelectItem>
                        <SelectItem value="shipped" className="text-blue-500">
                          SHIPPED
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {convertKhmerDate(new Date(order.createdAt))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </main>
  )
}
