import { LoaderFunctionArgs } from "react-router"
import { prisma } from "~/lib/db.server"
import { invariantResponse } from "~/lib/utils"

export async function loader({ params }: LoaderFunctionArgs) {
  invariantResponse(params.imageId, "Image id is required")
  const image = await prisma.userImage.findUnique({
    where: { id: params.imageId },
    select: { contentType: true, altText: true, blob: true },
  })
  invariantResponse(image, "image not found")
  return new Response(image.blob, {
    headers: {
      "content-type": image.contentType,
      "content-length": Buffer.byteLength(image.blob).toString(),
      "content-description": `inline, filename="${params.imageId}"`,
      "cache-control": "public, max-age=31536000, immutable",
    },
  })
}
