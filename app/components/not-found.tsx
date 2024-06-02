import { Link } from "@remix-run/react"
import { Button } from "./ui/button"
import { ChevronLeft } from "lucide-react"

interface NotFoundProps {
  text: string
}
export default function NotFound({ text }: NotFoundProps) {
  return (
    <div className="h-full w-full">
      <div
        className="h-full w-full bg-contain grid place-items-center bg-no-repeat font-bold text-2xl md:text-3xl lg:text-4xl text-white"
        style={{
          background:
            "url('/assets/images/notfound.png'), linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(9,9,121,1) 35%, rgba(0,212,255,1) 100%)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col items-center justify-center gap-y-6">
          <p className="px-4 py-2 bg-black/45 rounded-full text-center">
            {text}
          </p>
          <Link to="..">
            <Button variant={"secondary"}>
              <ChevronLeft />
              Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
