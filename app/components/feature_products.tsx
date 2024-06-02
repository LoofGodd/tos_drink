/**
 * v0 by Vercel.
 * @see https://v0.dev/t/umXvgTpUBXY
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { CardHeader, CardContent, Card } from "~/components/ui/card"
import { dollar } from "~/lib/utils"
import { Product } from "~/routes/menu+/$productId"
import { Link } from "@remix-run/react"

interface FeatureProps {
  products: Product[]
}
export default function FeatureProducts({ products }: FeatureProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h2 className="text-2xl font-bold mb-6">Trending</h2>
      <div className="grid gird-cols-1 sm:grid-cols-2  md:grid-cols-3 gap-6">
        {products.length === 0
          ? null
          : products.map((product) => (
              <Card key={product.id} className="w-full">
                <CardHeader>
                  <img
                    alt="Product "
                    className="w-full h-auto"
                    height="150"
                    src={`/resources/product-image/${product.image?.id}`}
                    style={{
                      aspectRatio: "150/150",
                      objectFit: "cover",
                    }}
                    width="150"
                  />
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-semibold">
                    <Link to={`/menu/${product.id}`}>{product.name}</Link>
                  </h3>
                  <p className="text-sm">{dollar(product.price)}</p>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
