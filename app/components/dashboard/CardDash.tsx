import { UsersIcon } from "lucide-react"
import React, { ReactNode } from "react"
import { Card, CardHeader, CardContent } from "../ui/card"

interface CardDashProps {
  heading: string
  content: string | number
  icon: ReactNode
}
export default function CardDash({ heading, content, icon }: CardDashProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {heading}
        </div>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-center text-rose-700">
          {content}
        </div>
      </CardContent>
    </Card>
  )
}
