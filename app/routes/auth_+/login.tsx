import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { z } from "zod"
import { getZodConstraint, parseWithZod } from "@conform-to/zod"
import { safeRedirect } from "remix-utils/safe-redirect"

import {
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
  type ActionFunctionArgs,
} from "@remix-run/node"
import { ErrorList } from "~/components/form"
import { sessionStorage } from "~/lib/session.server"
import { ShieldBan } from "lucide-react"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import { validateCSRF } from "~/lib/csrf.server"
import { login, requireAnonymous, sessionKey } from "~/lib/auth.server"

const loginFormSchema = z.object({
  username: z.string().min(5),
  password: z.string(),
  redirectTo: z.string().optional(),
  rememberMe: z.boolean().optional(),
})
export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  return json({})
}
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  await validateCSRF(formData, request.headers)
  const submission = await parseWithZod(formData, {
    schema: () =>
      loginFormSchema.transform(async (data, ctx) => {
        const session = await login({
          username: data.username,
          password: data.password,
        })

        if (!session) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid Credential",
          })
          return z.NEVER
        }
        return { ...data, session }
      }),
    async: true,
  })
  delete submission.payload.password
  if (submission.status !== "success") {
    return json(submission.reply(), {
      status: 400,
    })
  }

  if (!submission.value.session) {
    return json(
      submission.reply({
        formErrors: ["invalid credentials"],
      }),
      { status: 400 }
    )
  }
  const { session, redirectTo, rememberMe } = submission.value
  const sessionUser = await sessionStorage.getSession(
    request.headers.get("cookie")
  )
  sessionUser.set(sessionKey, session.id)
  return redirect(safeRedirect(redirectTo), {
    headers: {
      "set-cookie": await sessionStorage.commitSession(sessionUser, {
        expires: rememberMe
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 100)
          : undefined,
      }),
    },
  })
}

export default function Login() {
  const submission = useActionData<typeof action>()
  const [searParams] = useSearchParams()
  const redirectTo = searParams.get("redirectTo")
  const [form, fields] = useForm({
    id: "cafe_login",
    constraint: getZodConstraint(loginFormSchema),
    lastResult: submission,
    defaultValue: { redirectTo },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginFormSchema })
    },
  })
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>
          <Form className="space-y-4" method="POST" {...getFormProps(form)}>
            <AuthenticityTokenInput />
            <input
              hidden
              {...getInputProps(fields.redirectTo, { type: "text" })}
            />
            <div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor={fields.password.id}>Password</Label>
                <Link
                  className="text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  to="/auth/forget-password"
                >
                  Forgot Password?
                </Link>
              </div>
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
            <div className="flex gap-x-2 w-fit items-center justify-start">
              <Input
                className="h-4"
                {...getInputProps(fields.rememberMe, { type: "checkbox" })}
              />
              <Label
                htmlFor={fields.rememberMe.id}
                className="whitespace-nowrap"
              >
                Remember me
              </Label>
            </div>
            <div className="py-4">
              <p className="text-sm text-slate-500">
                New here?
                <Link to="/auth/register" className="text-blue-500">
                  create an account
                </Link>
              </p>
            </div>
            <Button className="w-full flex gap-2" type="submit">
              Login{" "}
              {Object.keys(form.allErrors).length !== 0 ? (
                <ShieldBan className="text-red-500" />
              ) : null}
            </Button>

            <div className="my-2">
              <ErrorList id={form.id} errors={form.errors} />
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}
export const meta: MetaFunction = () => {
  return [
    {
      title: "Cafe | login",
    },
    { name: "description", content: "Login in Cafe Pu Sok to order your cafe" },
  ]
}
