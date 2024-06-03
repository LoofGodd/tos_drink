import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react"
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from "@remix-run/node"
import { z } from "zod"
import { getZodConstraint, parseWithZod } from "@conform-to/zod"
import { prisma } from "~/lib/db.server"
import { sessionStorage } from "~/lib/session.server"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { ErrorList } from "~/components/form"
import { requireAnonymous, sessionKey, signup } from "~/lib/auth.server"
import { sendEmail } from "~/lib/email.server"
import { verificationStorage } from "~/lib/verification.server"
import { verificationEmailKey } from "./register"
import VerifyHTML from "~/components/verifyTemplate"

const registerSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string(),
  confirmPassword: z.string(),
})
export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  const verificationCookie = await verificationStorage.getSession(
    request.headers.get("cookie")
  )
  const verificationEmail = verificationCookie.get(verificationEmailKey)
  if (!verificationEmail) throw redirect("/auth/register")

  return json({ email: verificationEmail })
}
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const verificationCookie = await verificationStorage.getSession(
    request.headers.get("cookie")
  )
  const verificationEmail = verificationCookie.get(verificationEmailKey)
  if (typeof verificationEmail !== "string") throw redirect("/auth/onboarding")

  const submission = await parseWithZod(formData, {
    schema: registerSchema.transform(async (data, ctx) => {
      let hasError = false
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          path: ["confirmPassword"],
          code: z.ZodIssueCode.custom,
          message: "Password was not match",
        })
        hasError = true
      }
      const emailExist = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      })

      const usernameExist = await prisma.user.findUnique({
        where: { username: data.username },
        select: { id: true },
      })
      if (emailExist) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: `Email:${data.email} already signed up`,
        })

        hasError = true
      }

      if (usernameExist) {
        ctx.addIssue({
          path: ["username"],
          code: z.ZodIssueCode.custom,
          message: `username:${data.username} is not available`,
        })

        hasError = true
      }
      if (hasError) return z.NEVER
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...userSigned } = data
      const session = await signup(userSigned)
      return { session }
    }),
    async: true,
  })
  if (submission.status !== "success") {
    return json(submission.reply(), { status: 400 })
  }
  const { session } = submission.value
  const sessionCookie = await sessionStorage.getSession(
    request.headers.get("cookie")
  )
  sessionCookie.set(sessionKey, session.id)
  const headers = new Headers()
  headers.append(
    "Set-Cookie",
    await sessionStorage.commitSession(sessionCookie)
  )
  headers.append(
    "Set-Cookie",
    await verificationStorage.destroySession(verificationCookie)
  )
  return redirect("/", {
    headers,
  })
}
export default function Register() {
  const { email } = useLoaderData<typeof loader>()
  const submission = useActionData<typeof action>()
  const [form, fields] = useForm({
    id: "cafe-register",
    constraint: getZodConstraint(registerSchema),
    lastResult: submission,
    defaultValue: { email },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: registerSchema })
    },
  })
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to {email}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Sign up to your account to get new experience
            </p>
          </div>
          <Form className="space-y-4" method="POST" {...getFormProps(form)}>
            <div>
              <input
                hidden
                {...getInputProps(fields.email, { type: "email" })}
              />
              <Label htmlFor={fields.username.id}>Username</Label>
              <Input
                placeholder="Enter your username"
                {...getInputProps(fields.username, { type: "text" })}
              />
              <div className="my-2">
                <ErrorList
                  id={fields.username.errorId}
                  errors={fields.username.errors}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={fields.password.id}>Password</Label>
              <Input
                placeholder="Enter your password"
                {...getInputProps(fields.password, { type: "password" })}
              />
              <div className="my-2">
                <ErrorList
                  id={fields.password.errorId}
                  errors={fields.password.errors}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={fields.confirmPassword.id}>Password</Label>
              <Input
                placeholder="Confirm password"
                {...getInputProps(fields.confirmPassword, { type: "password" })}
              />
              <div className="my-2">
                <ErrorList
                  id={fields.confirmPassword.errorId}
                  errors={fields.confirmPassword.errors}
                />
              </div>
            </div>
            <div className="py-4">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-blue-500">
                  Login now
                </Link>
              </p>
            </div>
            <Button className="w-full" type="submit">
              Register
            </Button>
            <div className="my-2">
              <ErrorList id={form.errorId} errors={form.errors} />
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
export const meta: MetaFunction = () => {
  return [
    { title: "Cafe | Register to Explore more" },
    {
      name: "description",
      content: "Cafe Pu Sok | Pu Sok Cafe | Pu sok Cafe Online",
    },
  ]
}
