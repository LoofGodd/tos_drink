import { Label } from "@radix-ui/react-label"
import { Form } from "@remix-run/react"
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

export function ProductEditor() {
  return (
    <div className="grid place-items-center bg-slate-500/10 h-full">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
          <CardDescription>Add a new product to your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form className="grid gap-4" encType="multipart/form-data">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" placeholder="Enter product name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Product Image</Label>
              <Input id="image" type="file" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                placeholder="Enter product price"
                type="number"
              />
            </div>
          </Form>
        </CardContent>
        <CardFooter>
          <Button>Save Product</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
