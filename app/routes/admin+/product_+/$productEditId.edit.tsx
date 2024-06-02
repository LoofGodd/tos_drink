import {
  useForm,
  getFormProps,
  getInputProps,
  getTextareaProps,
} from "@conform-to/react"
import { getZodConstraint, parseWithZod } from "@conform-to/zod"
import { createId as cuid2 } from "@paralleldrive/cuid2"
import { Label } from "@radix-ui/react-label"
import { LoaderFunctionArgs, json } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { ActionFunctionArgs } from "react-router"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import { z } from "zod"
import { ErrorList } from "~/components/form"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { validateCSRF } from "~/lib/csrf.server"
import { prisma } from "~/lib/db.server"
import { redirectWithToast } from "~/lib/toast.server"
import { invariantResponse } from "~/lib/utils"

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3
const AddProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      return !file || file.size < MAX_UPLOAD_SIZE
    }, "File Size must be less than 3MB"),
  description: z.string().optional(),
  price: z.number(),
})

export async function loader({ params }: LoaderFunctionArgs) {
  invariantResponse(params.productEditId, "Product Id is required")
  const productId = params.productEditId
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: { select: { id: true, altText: true, blob: true } },
    },
  })
  return json({ product })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  await validateCSRF(formData, request.headers)
  const submission = await parseWithZod(formData, {
    schema: AddProductSchema.transform(async (data, ctx) => {
      if (data.image) {
        const allowedFile = ["png", "jpg", "webp", "jpeg"]
        const allowed = allowedFile.find((fileType) =>
          data.image?.type.includes(fileType)
        )
        if (!allowed) {
          ctx.addIssue({
            path: ["image"],
            code: z.ZodIssueCode.custom,
            message: `Accepted only "${allowedFile.join(",")}" file`,
          })
          return z.NEVER
        }
      }
      return { ...data }
    }),
    async: true,
  })
  if (submission.status !== "success") {
    return json(submission.reply(), { status: 400 })
  }
  const { id, name, image, description, price } = submission.value

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
      },
    })

    if (image) {
      await tx.productImage.update({
        where: { productId: id },
        data: {
          id: cuid2(),
          altText: image.name,
          contentType: image.type,
          blob: Buffer.from(await image.arrayBuffer()),
        },
        select: { id: true },
      })
    }
    return tx
  })

  return redirectWithToast("/admin/product", {
    title: `Successfully edited`,
    description: `You have edit the product name: ${name} to your store`,
    type: "success",
  })
}

export default function ProductAddRoute() {
  const submission = useActionData<typeof action>()
  const { product } = useLoaderData<typeof loader>()
  const [form, fields] = useForm({
    id: "cafe__edit_product",
    constraint: getZodConstraint(AddProductSchema),
    lastResult: submission,
    defaultValue: {
      id: product?.id,
      description: product?.description,
      name: product?.name,
      price: product?.price,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AddProductSchema })
    },
  })
  return (
    <div className="grid place-items-center bg-slate-500/10 h-full">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
          <CardDescription>Add a new product to your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            className="grid gap-4"
            encType="multipart/form-data"
            {...getFormProps(form)}
            method="POST"
          >
            <input {...getInputProps(fields.id, { type: "hidden" })} />
            <AuthenticityTokenInput />
            <div className="grid gap-2">
              <Label htmlFor={fields.name.id}>Product Name</Label>
              <Input
                {...getInputProps(fields.name, { type: "text" })}
                placeholder="Enter product name"
              />
              <ErrorList id={fields.name.errorId} errors={fields.name.errors} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={fields.image.id}>Product Image</Label>
              <Input {...getInputProps(fields.image, { type: "file" })} />

              <ErrorList
                id={fields.image.errorId}
                errors={fields.image.errors}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={fields.description.id}>Description</Label>
              <Textarea
                {...getTextareaProps(fields.description)}
                placeholder="Enter product description"
              />
              <ErrorList
                id={fields.description.errorId}
                errors={fields.description.errors}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={fields.price.id}>Price</Label>
              <Input
                {...getInputProps(fields.price, { type: "text" })}
                placeholder="Enter product price"
                type="number"
              />
              <ErrorList
                id={fields.price.errorId}
                errors={fields.price.errors}
              />
            </div>
          </Form>
        </CardContent>
        <CardFooter>
          <Button type="submit" form={form.id}>
            Save Product
          </Button>
          <ErrorList id={form.id} errors={form.errors} />
        </CardFooter>
      </Card>
    </div>
  )
}
