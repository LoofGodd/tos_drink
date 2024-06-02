import {
  ActionFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from "@remix-run/node"
import { Form, Link, useActionData } from "@remix-run/react"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { prepareVerification } from "./verify"
import { prisma } from "~/lib/db.server"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { z } from "zod"
import { getZodConstraint, parseWithZod } from "@conform-to/zod"
import { ErrorList } from "~/components/form"
import { validateCSRF } from "~/lib/csrf.server"
import { sendEmail } from "~/lib/email.server"

const forgetPasswordSchema = z.object({
  usernameEmail: z.string(),
})
export const verificationResetPasswordKey = "resetPassword"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  await validateCSRF(formData, request.headers)
  const submission = parseWithZod(formData, {
    schema: forgetPasswordSchema,
  })
  if (submission.status !== "success") {
    return json({ submission: { ...submission.reply() } })
  }

  const { usernameEmail } = submission.value
  const user = await prisma.user.findFirstOrThrow({
    where: { OR: [{ username: usernameEmail }, { email: usernameEmail }] },
  })
  const type = "reset-password"
  const { redirectTo, verifyUrl, otp, verificationConfig } =
    await prepareVerification({
      type,
      target: user.email,
      request,
    })
  const response = await sendEmail({
    to: user.email,
    subject: "reset password",
    text: `Your code ${otp} ${verifyUrl}`,
  })
  const verificationData = {
    type,
    target: user.email,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  }
  await prisma.verification.upsert({
    where: { type_target: { type: type, target: user.email } },
    update: verificationData,
    create: verificationData,
  })
  return redirect(redirectTo.toString())
}

export default function ForgetPasswordRoute() {
  const data = useActionData<typeof action>()
  const [form, fields] = useForm({
    id: "forget-password_cafe",
    lastResult: data?.submission,
    constraint: getZodConstraint(forgetPasswordSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: forgetPasswordSchema })
    },
  })
  return (
    <div className="">
      <div className="text-center mb-16 flex flex-col gap-y-8">
        <h1 className="text-8xl font-bold">Forget Password</h1>
        <p className="text-lg">
          Enter You Username or Password to reset password
        </p>
      </div>
      <Form
        className="flex flex-col gap-y-8 w-[500px] mx-auto"
        method="POST"
        {...getFormProps(form)}
      >
        <AuthenticityTokenInput />
        <div>
          <label htmlFor={fields.usernameEmail.id}>Username or Password</label>
          <Input {...getInputProps(fields.usernameEmail, { type: "text" })} />
          <ErrorList
            id={fields.usernameEmail.id}
            errors={fields.usernameEmail.errors}
          />
        </div>
        <Button type="submit" className="w-full">
          Submit{" "}
        </Button>
        <ErrorList id={form.id} errors={form.errors} />
        <Link to="/auth/login">
          <Button type="button" variant={"link"}>
            Back to login
          </Button>
        </Link>
      </Form>
    </div>
  )
}
export const meta: MetaFunction = () => {
  return [
    {
      title: "Forget password",
    },
  ]
}
