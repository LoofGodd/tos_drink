import { LoaderFunctionArgs } from "@remix-run/node"
import { prisma } from "~/lib/db.server"
import { invariantResponse } from "~/lib/utils"
export async function loader({ params }: LoaderFunctionArgs) {
  invariantResponse(params.imageId, "Image id is required")
  const image = await prisma.productImage.findUnique({
    where: { id: params.imageId },
    select: { contentType: true, blob: true },
  })
  invariantResponse(image, "Image not found")
  return new Response(image.blob, {
    headers: {
      "content-type": image.contentType,
      "content-length": Buffer.byteLength(image.blob).toString(),
      "content-description": `inline; filename="${params.imageId}"`,
      "cache-control": "public, max-age=31536000, immutable",
    },
  })
}
