import { Card, CardHeader, CardContent } from "./ui/card"

export default function Categories() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Our Specialties
          </h2>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Handcrafted coffee made with love. Served fresh every day.
          </p>
        </div>
        <div className="mx-auto grid max-w-sm items-center gap-2 sm:max-w-4xl sm:grid-cols-2 md:gap-4 lg:max-w-5xl lg:grid-cols-3">
          <Card className="w-full">
            <CardHeader>
              <img
                alt="Product "
                className="w-full h-auto"
                height="300"
                src="/placeholder.svg"
                style={{
                  aspectRatio: "300/300",
                  objectFit: "cover",
                }}
                width="300"
              />
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold">Espresso</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Strong and bold
              </p>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader>
              <img
                alt="Product "
                className="w-full h-auto"
                height="300"
                src="/placeholder.svg"
                style={{
                  aspectRatio: "150/150",
                  objectFit: "cover",
                }}
                width="300"
              />
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold">Espresso</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Strong and bold
              </p>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardHeader>
              <img
                alt="Product "
                className="w-full h-auto"
                height="300"
                src="/placeholder.svg"
                style={{
                  aspectRatio: "150/150",
                  objectFit: "cover",
                }}
                width="300"
              />
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold">Espresso</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Strong and bold
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
