import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { getZodConstraint, parseWithZod } from "@conform-to/zod"
import { ActionFunctionArgs, json } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import { z } from "zod"
import { ErrorList } from "~/components/form"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { validateCSRF } from "~/lib/csrf.server"
import { verificationStorage } from "~/lib/verification.server"
import { verificationResetPasswordKey } from "./forget-password"
import { prisma } from "~/lib/db.server"
import { createPassword } from "~/lib/db-utils"
import { redirectWithToast } from "~/lib/toast.server"
import { requireResetPasswordCookie } from "~/lib/verify.server"

const newPasswordSchema = z.object({
  newPassword: z.string(),
  confirmPassword: z.string(),
})

export async function loader({ request }: ActionFunctionArgs) {
  await requireResetPasswordCookie(request)
  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  await validateCSRF(formData, request.headers)
  const submission = await parseWithZod(formData, {
    schema: newPasswordSchema.superRefine(async (data, ctx) => {
      if (data.confirmPassword !== data.newPassword) {
        ctx.addIssue({
          path: ["conformPassword"],
          code: z.ZodIssueCode.custom,
          message: "password not match",
        })
        return z.NEVER
      }
    }),
    async: true,
  })
  if (submission.status !== "success")
    return json({ status: "error", submission: submission.reply() })
  const verificationSession = await verificationStorage.getSession(
    request.headers.get("cookie")
  )
  const target = verificationSession.get(verificationResetPasswordKey)
  if (typeof target !== "string")
    return json({
      submission: submission.reply({
        formErrors: ["You are not validate in the same browser"],
      }),
    })

  const newHash = createPassword(submission.value.newPassword).hash
  await prisma.user.update({
    where: { email: target },
    data: { password: { update: { hash: newHash } } },
    select: { id: true },
  })
  return redirectWithToast(
    "/auth/login",
    {
      title: "Successful  reset password",
      type: "success",
      description: "You have successfully change the password",
    },
    {
      headers: {
        "set-cookie": await verificationStorage.destroySession(
          verificationSession
        ),
      },
    }
  )
}

export default function NewPasswordRoute() {
  const data = useActionData<typeof action>()
  const [form, fields] = useForm({
    id: "new_password_cafe",
    lastResult: data?.submission,
    constraint: getZodConstraint(newPasswordSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: newPasswordSchema })
    },
  })
  return (
    <div className="">
      <div className="text-center mb-16 mt-20 flex flex-col gap-y-8">
        <h1 className="text-8xl font-bold">Create New Password</h1>
        <p className="text-lg">Reset Password almost ready</p>
      </div>
      <Form
        className="flex flex-col gap-y-8 w-[500px] mx-auto"
        method="POST"
        {...getFormProps(form)}
      >
        <AuthenticityTokenInput />
        <div>
          <label htmlFor={fields.newPassword.id}>New Password</label>{" "}
          <Input {...getInputProps(fields.newPassword, { type: "text" })} />
        </div>

        <div>
          <label htmlFor={fields.confirmPassword.id}>New Password</label>{" "}
          <Input {...getInputProps(fields.confirmPassword, { type: "text" })} />
        </div>
        <Button type="submit" className="w-full">
          Submit{" "}
        </Button>
        <ErrorList id={form.id} errors={form.errors} />
      </Form>
    </div>
  )
}
