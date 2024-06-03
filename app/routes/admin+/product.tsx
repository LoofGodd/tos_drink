import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover"
import { FlipVerticalIcon, FilePlus2, Edit2Icon, Trash } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table"
import {
  Link,
  json,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import { dollar, getProductImage, shortString } from "~/lib/utils"
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import { prisma } from "~/lib/db.server"

export async function loader() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: { select: { id: true, altText: true } },
    },
  })
  return json({ products })
}

export const deleteAction = "deleteActionId"
export default function ProductAdminRoute() {
  const { products } = useLoaderData<typeof loader>()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const addDeleteAction = (name: string, value: string) => {
    setSearchParams(
      (prev) => {
        prev.set(name, value)
        return prev
      },
      { preventScrollReset: true }
    )
  }

  return (
    <main className=" p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-medium">Transactions</h1>
        <Link to="new">
          <Button
            className="px-2 py-1 bg-gray-800 text-white rounded-lg flex items-center space-x-2 text-sm"
            type="button"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Add</span>
          </Button>
        </Link>
      </div>
      <ScrollArea className="w-[500px] sm:w-[600px] md:w-[750px] lg:w-[700px] xl:w-full">
        <Table className="overflow-x-scroll">
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
              <TableHead> Amount</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                onClick={() => navigate(product.id)}
                className="cursor-pointer"
              >
                <TableCell>{shortString(product.id, 10)}</TableCell>
                <TableCell>
                  <img
                    height={50}
                    width={50}
                    style={{
                      aspectRatio: 1 / 1,
                      objectFit: "cover",
                    }}
                    className="bg-cover"
                    src={getProductImage(product?.image?.id)}
                    alt={product.image?.altText ?? ""}
                  />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell colSpan={3}>
                  {shortString(product.description ?? "", 20)}
                </TableCell>
                <TableCell>{dollar(product.price)}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger onClick={(e) => e.stopPropagation()}>
                      <Button
                        className="px-2 py-1 bg-transparent text-black hover:bg-gray-200 active:bg-gray-300 rounded"
                        type="button"
                      >
                        <FlipVerticalIcon className="w-4 h-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-40 border border-border bg-white/95"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link to={`${product.id}/edit`}>
                        <button className="w-full flex items-center space-x-2 hover:bg-gray-200 active:bg-gray-300 py-2 px-2 rounded-lg text-gray-500">
                          <Edit2Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                      </Link>

                      {/* <button
                        className="w-full flex items-center space-x-2 hover:bg-gray-200 active:bg-gray-300 py-2 px-2 rounded-lg text-gray-500"
                        onClick={() =>
                          addDeleteAction(deleteAction, product.id)
                        }
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">Delete</span>
                      </button> */}
                    </PopoverContent>
                  </Popover>
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
