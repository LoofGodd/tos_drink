import { Link } from "@remix-run/react"
import { Button } from "./ui/button"
export default function Hero() {
  return (
    <section className="w-full">
      <div className="container px-4 md:px-6">
        <div className="relative rounded-md overflow-hidden">
          <img
            alt="Hero"
            className="mx-auto w-full h-[500px] aspect-video overflow-hidden object-bottom"
            src="assets/background/slideshow.jpg"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-center bg-gray-900/40 text-gray-50 dark:bg-gray-50 dark:text-gray-900">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                The Future of the Web
              </h1>
              <p className="max-w-[600px] text-sm text-gray-300 md:text-xl dark:text-gray-400">
                The only platform you need to build the fastest, most secure web
                experiences.
              </p>
            </div>
            <Button asChild>
              <Link to="menu">Shop Now</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
