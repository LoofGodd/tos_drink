import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { ActionFunctionArgs, MetaFunction, json } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import { z } from "zod"
import { EmailJSResponseStatus, send, sendForm } from "@emailjs/browser"
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react"
import { getZodConstraint, parseWithZod } from "@conform-to/zod"
import { ErrorList } from "~/components/form"
import { FormEvent, useEffect, useRef, useState } from "react"
import { TicketCheck } from "lucide-react"

const feedbackSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  feedback: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const submission = parseWithZod(formData, { schema: feedbackSchema })
  if (submission.status !== "success")
    return json(
      { submission: { ...submission.reply() }, status: "error" },
      { status: 400 }
    )
  return json({
    submission: { ...submission.reply() },
    status: "error",
    value: submission.value,
  })
}
export default function FeedBack() {
  const data = useActionData<typeof action>()
  const ref = useRef<HTMLFormElement>(null)
  const [sent, setSent] = useState(false)
  const onSubmit = (e: FormEvent<HTMLElement>) => {
    e.preventDefault()
    sendForm(
      "service_9x9fzyg",
      "template_bjvs7ff",
      ref.current ?? "",
      "wSvuzCw8n3PGmX1K9"
    )
      .then((res) => {
        console.log("feedback sent ", res.text)
        setSent(true)
      })
      .catch((e) => {
        setSent(false)
        console.log(e)
      })
  }
  const [form, fields] = useForm({
    id: "feedback_cafe",
    constraint: getZodConstraint(feedbackSchema),
    lastResult: data?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: feedbackSchema })
    },
  })
  useEffect(() => {
    setTimeout(() => {
      setSent(false)
    }, 10000)
  }, [sent])
  return (
    <div className="space-y-8 px-5 md:px-28 lg:px-32 mt-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">We'd love your feedback</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Have a feature request, suggestion, or just want to let us know what
          you think? We'd love to hear from you. Fill out the form below.
        </p>
      </div>
      <Form
        ref={ref}
        className="space-y-4"
        {...getFormProps(form)}
        method="POST"
        onSubmit={onSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={fields.name.id}>Name</Label>
            <Input
              {...getInputProps(fields.name, { type: "text" })}
              placeholder="Enter your name"
            />
            <ErrorList id={fields.name.errorId} errors={fields.name.errors} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={fields.email.id}>Email</Label>
            <Input
              {...getInputProps(fields.email, { type: "email" })}
              placeholder="Enter your email"
            />
            <ErrorList id={fields.email.errorId} errors={fields.email.errors} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={fields.feedback.id}>Feedback</Label>
          <Textarea
            {...getTextareaProps(fields.feedback)}
            className="min-h-[100px]"
            placeholder="Enter your feedback"
          />
          <ErrorList
            id={fields.feedback.errorId}
            errors={fields.feedback.errors}
          />
        </div>
        <Button type="submit" className="flex gap-x-6">
          Submit feedback {sent ? <TicketCheck /> : null}
        </Button>
      </Form>
      <ErrorList id={form.errorId} errors={form.errors} />
    </div>
  )
}
export const meta: MetaFunction = () => {
  return [{ title: "Cafe | Feedback" }]
}
