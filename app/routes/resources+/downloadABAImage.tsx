import { LoaderFunctionArgs } from "@remix-run/node"
import { getDomainUrl } from "~/lib/utils"

export async function loader({ request }: LoaderFunctionArgs) {
  const domain = getDomainUrl(request)
  const image = await fetch(`${domain}/photo/aba.png`)
  const imageData = await image.blob()
  return new Response(imageData, {
    headers: {
      "Content-Disposition": `attachment; filename="aba.png"`,
    },
  })
}
