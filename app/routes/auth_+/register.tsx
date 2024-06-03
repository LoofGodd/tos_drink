import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { Form } from "@remix-run/react"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { getZodConstraint, parseWithZod } from "@conform-to/zod"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from "@remix-run/node"
import { validateCSRF } from "~/lib/csrf.server"
import { generateTOTP } from "@epic-web/totp"
import { getDomainUrl } from "~/lib/utils"
import { sendEmail } from "~/lib/email.server"
import { prisma } from "~/lib/db.server"
import { codeQueryParam, targetQueryParam, typeQueryParam } from "./verify"
import { requireAnonymous } from "~/lib/auth.server"
import VerifyHTML from "~/components/verifyTemplate"

export const verificationEmailKey = "verificationEmail"
const EmailSchema = z.object({
  email: z.string().email(),
})

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return json({})
}
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  validateCSRF(formData, request.headers)
  const submission = parseWithZod(formData, { schema: EmailSchema })
  if (submission.status !== "success")
    return json({ submission: { ...submission.reply() } }, { status: 400 })

  const { email } = submission.value
  const { otp, ...verificationConfig } = generateTOTP({
    algorithm: "SHA256",
    period: 10 * 60,
  })

  const redirectTo = new URL(`${getDomainUrl(request)}/auth/verify`)
  const type = "onboarding"
  redirectTo.searchParams.set(typeQueryParam, type)
  redirectTo.searchParams.set(targetQueryParam, email)
  const verifyUrl = new URL(redirectTo)
  verifyUrl.searchParams.set(codeQueryParam, otp)
  const sentEmail = await sendEmail({
    to: email,
    subject: "Verify to register an account",
    react: (
      <VerifyHTML
        validationCode={otp}
        url={verifyUrl.toString()}
        head="Verify Your before create"
      />
    ),
  })
  const verificationData = {
    type,
    target: email,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  }

  await prisma.verification.upsert({
    where: { type_target: { type, target: email } },
    create: verificationData,
    update: verificationData,
  })

  return redirect(redirectTo.toString())
}

export default function Signup() {
  const [form, fields] = useForm({
    id: "email_register_cafe",
    constraint: getZodConstraint(EmailSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EmailSchema })
    },
  })
  return (
    <div className="max-w-[800px]">
      <div className="text-center flex flex-col gap-y-12">
        <h1 className="text-8xl font-bold">Let&apos;s start your journey</h1>
        <p className="text-gray-600 text-xl">Please enter your email</p>
      </div>
      <Form
        className="flex flex-col gap-y-8"
        {...getFormProps(form)}
        method="POST"
      >
        <AuthenticityTokenInput />
        <div>
          <label htmlFor={fields.email.id}>Email</label>
          <Input {...getInputProps(fields.email, { type: "email" })} />
        </div>
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </Form>
    </div>
  )
}
export const meta: MetaFunction = () => {
  return [{ title: "Register | Explore more about use" }]
}
