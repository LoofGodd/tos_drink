import {
  Submission,
  getFormProps,
  getInputProps,
  useForm,
} from "@conform-to/react"
import { Form, useActionData, useSearchParams } from "@remix-run/react"
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
import { generateTOTP, verifyTOTP } from "@epic-web/totp"
import { prisma } from "~/lib/db.server"
import { OctagonAlert } from "lucide-react"
import { ErrorList } from "~/components/form"
import { getDomainUrl } from "~/lib/utils"
import {
  handleOnboardingVerification,
  handleResetPasswordVerification,
} from "~/lib/verify.server"
import { requireAnonymous } from "~/lib/auth.server"

export const typeQueryParam = "type"
export const targetQueryParam = "target"
export const codeQueryParam = "code"
export const redirectToQueryParam = "redirectTo"

const type = ["onboarding", "reset-password"] as const

const verificationTypeSchema = z.enum(type)
type verificationType = z.infer<typeof verificationTypeSchema>

const verificationSchema = z.object({
  [typeQueryParam]: verificationTypeSchema,
  [targetQueryParam]: z.string(),
  [codeQueryParam]: z.string().min(6).max(6),
  [redirectToQueryParam]: z.string().optional(),
})

interface PrepareVerification {
  type: verificationType
  target: string
  request: Request
}

export interface VerifyFunctionAgs {
  request: Request
  submission: Submission<z.infer<typeof verificationSchema>>
  body: URLSearchParams | FormData
}

export async function prepareVerification({
  type,
  target,
  request,
}: PrepareVerification) {
  const { otp, ...verificationConfig } = generateTOTP({
    algorithm: "SHA256",
    period: 10 * 60,
  })
  const redirectTo = new URL(`${getDomainUrl(request)}/auth/verify`)
  redirectTo.searchParams.set(typeQueryParam, type)
  redirectTo.searchParams.set(targetQueryParam, target)
  const verifyUrl = new URL(redirectTo)
  verifyUrl.searchParams.set(codeQueryParam, otp)
  return { redirectTo, verifyUrl, otp, verificationConfig }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)

  const params = new URL(request.url).searchParams
  const type = params.get(typeQueryParam) ?? ""
  const target = params.get(targetQueryParam) ?? ""
  const verification = await prisma.verification.findUnique({
    where: { type_target: { type, target } },
  })
  if (!verification) throw redirect("/")
  if (!params.get(codeQueryParam)) {
    return json({})
  }
  return validateRequest(request, params)
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  validateCSRF(formData, request.headers)
  return validateRequest(request, formData)
}
async function validateRequest(
  request: Request,
  body: URLSearchParams | FormData
) {
  const submission = await parseWithZod(body, {
    schema: verificationSchema.superRefine(async (data, ctx) => {
      const verification = await prisma.verification.findUnique({
        where: {
          type_target: {
            target: data[targetQueryParam],
            type: data[typeQueryParam],
          },
          OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
        },
      })
      if (!verification) {
        ctx.addIssue({
          path: [codeQueryParam],
          code: z.ZodIssueCode.custom,
          message: "Invalid Code",
        })
        return z.NEVER
      }
      const codeValid = verifyTOTP({
        otp: data[codeQueryParam],
        ...verification,
      })

      if (!codeValid) {
        ctx.addIssue({
          path: [codeQueryParam],
          code: z.ZodIssueCode.custom,
          message: "Invalid Code",
        })
        return z.NEVER
      }
    }),
    async: true,
  })
  if (submission.status !== "success")
    return json({ submission: { ...submission.reply() }, status: "idle" })
  const { value: submissionValue } = submission

  await prisma.verification.delete({
    where: {
      type_target: {
        target: submissionValue[targetQueryParam],
        type: submissionValue[typeQueryParam],
      },
    },
  })

  switch (submissionValue[typeQueryParam]) {
    case "onboarding":
      return handleOnboardingVerification({
        request,
        submission,
        body,
      })
      break
    case "reset-password":
      return handleResetPasswordVerification({
        request,
        submission,
        body,
      })
      break
    default:
      throw new Error("No Type")
      break
  }
}
export default function Signup() {
  const [searchParams] = useSearchParams()
  const data = useActionData<typeof action>()
  const [form, fields] = useForm({
    id: "verify_cafe",
    constraint: getZodConstraint(verificationSchema),
    lastResult: data?.submission,
    defaultValue: {
      code: searchParams.get(codeQueryParam) ?? "",
      type: searchParams.get(typeQueryParam) ?? "",
      target: searchParams.get(targetQueryParam) ?? "",
      redirectTo: searchParams.get(redirectToQueryParam),
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: verificationSchema })
    },
  })
  return (
    <div className="max-w-[800px]">
      <div className="text-center mb-16">
        <h1 className="text-8xl font-bold">Verify</h1>
      </div>
      <Form
        className="flex flex-col gap-y-8"
        {...getFormProps(form)}
        method="POST"
      >
        <AuthenticityTokenInput />
        <input {...getInputProps(fields[typeQueryParam], { type: "hidden" })} />
        <input
          {...getInputProps(fields[targetQueryParam], { type: "hidden" })}
        />
        <input
          {...getInputProps(fields[redirectToQueryParam], { type: "hidden" })}
        />
        <div>
          <label htmlFor={fields[codeQueryParam].id}>verify</label>
          <Input {...getInputProps(fields[codeQueryParam], { type: "text" })} />
          <ErrorList
            id={fields[codeQueryParam].errorId}
            errors={fields[codeQueryParam].errors}
          />
        </div>
        <Button type="submit" className="w-full">
          Submit{" "}
          {fields[codeQueryParam].errors ? (
            <OctagonAlert className="text-red-600 ml-4" />
          ) : null}
        </Button>
      </Form>
    </div>
  )
}

export const meta: MetaFunction = ({ location }) => {
  const searchQuery = new URLSearchParams(location.search)
  const type = searchQuery.get(typeQueryParam)
  const target = searchQuery.get(targetQueryParam)
  let message =
    type === "onboarding"
      ? `create account with${target}`
      : type === "reset-password"
      ? `reset password of ${target}`
      : "Your account"
  message = `verify | ${message}`
  return [{ title: message }]
}
