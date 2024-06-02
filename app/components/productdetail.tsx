import { Label } from "~/components/ui/label"
import { RadioGroupItem, RadioGroup } from "~/components/ui/radio-group"
import { Button } from "~/components/ui/button"
import { Slider } from "./ui/slider"
import React, { useState } from "react"
import { Form, Link, useParams } from "@remix-run/react"
import { dollar } from "~/lib/utils"
import { z } from "zod"
import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { getZodConstraint, parseWithZod } from "@conform-to/zod"
import { Product } from "~/routes/menu+/$productId"
import { ArrowLeft } from "lucide-react"

export const productDetailSchema = z.object({
  kuch: z.string().default("none"),
  size: z.string().default("regular"),
  ice: z.string().default("general"),
  sugar: z.number(),
  status: z.enum(["hide", "show"]).default("show"),
})

const imagePath = "/assets/images/material"
interface ProductDetailProps {
  product: Product | null
}
interface selectionItem {
  id: string
  name: string
  image: string
  check?: boolean
}
const Kuchs = [
  {
    id: "BlackJello",
    name: "Black Jello",
    image: `${imagePath}/black_Jelly.jpg`,
  },
  {
    id: "whiteJelly",
    name: "White Jelly",
    image: `${imagePath}/white_Jelly.jpg`,
  },
  {
    id: "7Colors",
    name: "7 Colors Jelly",
    image: `${imagePath}/7_color_Jelly.jpg`,
  },
]
const sizes = [
  {
    id: "cafeSizeSmall",
    name: "Small",
    image: `${imagePath}/smallSize.jpg`,
    check: true,
  },
  {
    id: "cafeSizeMedium",
    name: "Regular",
    image: `${imagePath}/regularSize.jpg`,
  },
  { id: "cafeSizeBig", name: "Big", image: `${imagePath}/bigSize.jpg` },
]

const ices = [
  {
    id: "lessIce",
    name: "Less",
    image: `${imagePath}/lessIce.jpg`,
    check: true,
  },
  { id: "generalIce", name: "General", image: `${imagePath}/regularIce.jpg` },
  { id: "manyIce", name: "Many", image: `${imagePath}/manyIce.jpg` },
]

export default function ProductDetail({ product }: ProductDetailProps) {
  const { productId } = useParams()
  const [form, fields] = useForm({
    id: "product-detail-cafe",
    constraint: getZodConstraint(productDetailSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productDetailSchema })
    },
  })
  return (
    <div className="grid gap-4 lg:gap-8 max-w-6xl px-4 mx-auto py-6">
      <Button asChild variant={"outline"} className="w-fit">
        <Link to="..">
          <ArrowLeft /> Back
        </Link>
      </Button>
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <img
              alt="Top Story "
              className="w-full object-cover object-center rounded-lg"
              height="400"
              src={`/resources/product-image/${product?.image?.id}`}
              style={{
                aspectRatio: "600/600",
                objectFit: "cover",
              }}
              width="600"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-2">{product?.name}</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              {product?.description}
            </p>
            <p className="text-xl font-bold mt-3">{dollar(product?.price)}</p>
          </div>
        </div>
      </section>

      <Form
        className="grid gap-4 md:gap-8"
        {...getFormProps(form)}
        method="POST"
      >
        <input hidden name="productId" defaultValue={productId} />
        <LevelSugar
          inputProps={{ ...getInputProps(fields.sugar, { type: "text" }) }}
        />
        <Selection
          items={Kuchs}
          labelProps={{ children: "គុដ", id: fields.kuch.id }}
          buttonProps={getInputProps(fields.kuch, { type: "radio" })}
        />
        <Selection
          items={ices}
          labelProps={{ children: "Ice", id: fields.ice.id }}
          buttonProps={getInputProps(fields.size, { type: "radio" })}
        />
        <Selection
          items={sizes}
          labelProps={{ children: "Size", id: fields.size.id }}
          buttonProps={getInputProps(fields.ice, { type: "radio" })}
        />
        <Button type="submit" size="lg">
          Add to cart
        </Button>
      </Form>
    </div>
  )
}

interface selectionProps {
  items: selectionItem[]
  buttonProps: React.HtmlHTMLAttributes<HTMLButtonElement> & { name: string }
  labelProps: React.HtmlHTMLAttributes<HTMLLabelElement>
}
function Selection({ items, buttonProps, labelProps }: selectionProps) {
  return (
    <div className="grid gap-2">
      <Label className="text-base" {...labelProps} />
      <RadioGroup
        className="flex items-center gap-2"
        defaultValue="black"
        name={buttonProps.name}
      >
        {items.map((item) => (
          <Label
            key={item.id}
            className="border cursor-pointer rounded-md p-2 flex flex-col items-center gap-2 [&:has(:checked)]:bg-gray-100 dark:[&:has(:checked)]:bg-gray-800"
            htmlFor={item.id}
          >
            <img
              src={item.image}
              alt={item.name}
              className="object-cover"
              height="200"
              width="200"
              style={{ aspectRatio: "1/1", objectFit: "cover" }}
            />
            <div className="flex gap-x-0.5">
              <RadioGroupItem value={item.name} id={item.id} type="button" />
              <p>{item.name}</p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  )
}
function LevelSugar({
  inputProps,
}: {
  inputProps: React.HtmlHTMLAttributes<HTMLInputElement>
}) {
  const [levelSugar, setLevelSugar] = useState(100)
  return (
    <div className="grid gap-2">
      <h1 className="text-base">Level Sugar</h1>

      <div className="flex gap-2">
        <Slider
          {...inputProps}
          defaultValue={[levelSugar]}
          min={30}
          max={100}
          step={10}
          className="w-[60%]"
          onValueChange={(e) => {
            setLevelSugar(e[0])
          }}
        />
        <p>{levelSugar}</p>
      </div>
    </div>
  )
}
