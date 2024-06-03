import { MetaFunction } from "@remix-run/node"
import Email from "~/components/email"

export default function about() {
  return (
    <div>
      <div className="w-full py-12 lg:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-6 min-h-[400px] items-center justify-center space-y-6 text-center lg:gap-12 lg:grid lg:grid-cols-3 lg:items-start lg:space-y-0">
            <div className="flex flex-col gap-2 lg:col-span-1 lg:grid lg:gap-4 lg:items-start">
              <div className="space-y-2 text-lg lg:text-base">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl">
                  Welcome to Our Cafe
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Coffee Enthusiast
                </p>
              </div>
              <div className="space-y-2 text-sm prose text-gray-500 dark:text-gray-400 lg:max-w-[600px]">
                <p>
                  We are dedicated to providing the best coffee experience for
                  our customers. Our cafe is a place where you can relax, enjoy
                  a cup of freshly brewed coffee, and indulge in delicious
                  pastries.
                </p>
              </div>
            </div>
            <div className="flex justify-center lg:col-span-2">
              <img
                alt="Cafe "
                className="rounded-full"
                height="300"
                src="/assets/background/slideshow.jpg"
                style={{
                  aspectRatio: "300/300",
                  objectFit: "cover",
                }}
                width="300"
              />
            </div>
            <div className="grid gap-2 text-sm lg:grid-cols-2 lg:gap-4">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Location</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Main Street Cafe
                    <br />
                    <span className="text-sm font-normal">123 Main Street</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Hours</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Monday - Friday
                    <br />
                    <span className="text-sm font-normal">
                      8:00 AM - 6:00 PM
                    </span>
                  </li>
                  <li>
                    Saturday - Sunday
                    <br />
                    <span className="text-sm font-normal">
                      9:00 AM - 5:00 PM
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const meta: MetaFunction = () => {
  return [{ title: `Cafe | About our shop` }]
}
