import React from "react"

interface GradientProps {
  kuch: string | null
  sugar: string | null
  ice: string | null
  size: string | null
}
export default function Gradient({ kuch, sugar, ice, size }: GradientProps) {
  return (
    <ul className="grid grid-cols-3 gird-rows-4 items-start text-gray-500 text-sm w-full">
      <li className="row-start-1 col-start-1 col-span-1">Kuch</li>
      <li className="col-span-2">:{kuch}</li>
      <li className="row-start-2 col-start-1 col-span-1">Sugar</li>
      <li className="col-span-2">:{sugar}</li>
      <li className="row-start-3 col-start-1 col-span-1">Ice</li>
      <li className="col-span-2">:{ice}</li>
      <li className="row-start-4 col-start-1 col-span-1">Size</li>
      <li className="col-span-2">:{size}</li>
    </ul>
  )
}
