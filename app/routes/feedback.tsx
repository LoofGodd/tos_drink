import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"
import { MetaFunction } from "@remix-run/node"

export default function FeedBack() {
  return (
    <div className="space-y-8 px-5 md:px-28 lg:px-32 mt-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">We'd love your feedback</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Have a feature request, suggestion, or just want to let us know what
          you think? We'd love to hear from you. Fill out the form below.
        </p>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="Enter your email" type="email" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback">Feedback</Label>
          <Textarea
            className="min-h-[100px]"
            id="feedback"
            placeholder="Enter your feedback"
          />
        </div>
        <Button>Submit feedback</Button>
      </div>
    </div>
  )
}

export const meta: MetaFunction = () => {
  return [{ title: `Cafe | Feedback our shop` }]
}
