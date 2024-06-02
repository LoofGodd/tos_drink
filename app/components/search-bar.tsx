import { Form, useSearchParams } from "@remix-run/react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useState } from "react"

export default function SearchBar({ className }: { className?: string }) {
  const [param] = useSearchParams()
  const [search, setSearch] = useState(param.get("s"))
  return (
    <Form method="get" className={className}>
      <Input
        name="s"
        type="text"
        placeholder="search your favorite product..."
        value={search ?? ""}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button type="submit">Search</Button>
    </Form>
  )
}
