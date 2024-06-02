import { Form, Link } from "@remix-run/react"
import { AuthenticityTokenInput } from "remix-utils/csrf/react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

export default function ForgetPasswordRoute() {
  return (
    <div className="">
      <div className="text-center mb-16">
        <h1 className="text-8xl font-bold">Forget Password</h1>
        <p className="text-lg">No Worried forgetting password anymore</p>
      </div>
      <Form className="flex flex-col gap-y-8 w-[500px] mx-auto" method="POST">
        <AuthenticityTokenInput />
        <div>
          <label htmlFor={"lksd"}>Username or Password</label>
          <Input />
        </div>
        <Button type="submit" className="w-full">
          Submit{" "}
        </Button>
        <Link to="/auth/login">
          <Button variant={"link"}>Back to login</Button>
        </Link>
      </Form>
    </div>
  )
}
