"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Sample healthcare-specific data
const chartData = [
  { month: "January", inPersonVisits: 120, telehealthVisits: 80 },
  { month: "February", inPersonVisits: 150, telehealthVisits: 90 },
  { month: "March", inPersonVisits: 200, telehealthVisits: 120 },
  { month: "April", inPersonVisits: 160, telehealthVisits: 130 },
  { month: "May", inPersonVisits: 180, telehealthVisits: 140 },
  { month: "June", inPersonVisits: 210, telehealthVisits: 160 },
]

const chartConfig = {
  inPersonVisits: {
    label: "In-Person Visits",
    color: "#FF5722", // Vibrant Orange for In-Person Visits
  },
  telehealthVisits: {
    label: "Telehealth Visits",
    color: "#007BFF", // Vibrant Blue for Telehealth Visits
  },
} satisfies ChartConfig

export function AdminAreaChart() {
  return (
    <Card style={{ height: '390px' }}>
      <CardHeader>
        <CardTitle>Area Chart - Patient Visits</CardTitle>
        <CardDescription>
          Showing total patient visits for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-8">
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="telehealthVisits"
              type="natural"
              fill="#007BFF" // Fill color for Telehealth Visits
              fillOpacity={0.4}
              stroke="#007BFF" // Stroke color for Telehealth Visits
              stackId="a"
            />
            <Area
              dataKey="inPersonVisits"
              type="natural"
              fill="#FF5722" // Fill color for In-Person Visits
              fillOpacity={0.4}
              stroke="#FF5722" // Stroke color for In-Person Visits
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}