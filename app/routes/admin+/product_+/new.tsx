import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react"
import { getZodConstraint, parseWithZod } from "@conform-to/zod"
import { Label } from "@radix-ui/react-label"
import { ActionFunctionArgs, json } from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"
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

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3
const AddProductSchema = z.object({
  name: z.string(),
  image: z.instanceof(File).refine((file) => {
    return !file || file.size < MAX_UPLOAD_SIZE
  }, "File Size must be less than 3MB"),
  description: z.string().optional(),
  price: z.number(),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  await validateCSRF(formData, request.headers)
  const submission = await parseWithZod(formData, {
    schema: AddProductSchema.transform(async (data, ctx) => {
      const allowedFile = ["png", "jpg", "webp", "jpeg"]
      let hasError = false
      const allowed = allowedFile.find((fileType) =>
        data.image.type.includes(fileType)
      )
      const nameUsed = await prisma.product.findUnique({
        where: { name: data.name },
        select: { id: true },
      })
      if (nameUsed) {
        ctx.addIssue({
          path: ["name"],
          code: z.ZodIssueCode.custom,
          message: "Product's name is already used",
        })
        hasError = true
      }
      if (!allowed) {
        ctx.addIssue({
          path: ["image"],
          code: z.ZodIssueCode.custom,
          message: `Accepted only ${allowedFile.join(",")} file`,
        })
        hasError = true
      }
      if (hasError) return z.NEVER
      return { ...data }
    }),
    async: true,
  })
  if (submission.status !== "success") {
    return json(submission.reply(), { status: 400 })
  }
  const { name, image, description, price } = submission.value
  await prisma.product.create({
    data: {
      name,
      description,
      price,
      image: {
        create: {
          altText: image.name,
          contentType: image.type,
          blob: Buffer.from(await image.arrayBuffer()),
        },
      },
    },
  })
  return redirectWithToast("/admin/product", {
    title: `Successfully Added`,
    description: `You have added the product name: ${name} to your store`,
    type: "success",
  })
}

export default function ProductAddRoute() {
  const submission = useActionData<typeof action>()
  const [form, fields] = useForm({
    id: "cafe__New_product",
    constraint: getZodConstraint(AddProductSchema),
    lastResult: submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AddProductSchema })
    },
  })
  const navigation = useNavigation()
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
          <Button
            type="submit"
            form={form.id}
            className="flex gap-4 items-center"
          >
            <span>Save Product</span>
            {navigation.state === "submitting" ? (
              <div className="border-white w-6 h-6 rounded-full border-l-4 border-t-4 border-dotted animate-spin"></div>
            ) : null}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
