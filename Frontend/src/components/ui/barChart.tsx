"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Sample data reflecting patient visits for two clinics
const chartData = [
  { date: "2024-04-01", sasoon: 222, rubyHall: 150 },
  { date: "2024-04-02", sasoon: 97, rubyHall: 180 },
  { date: "2024-04-03", sasoon: 167, rubyHall: 120 },
  { date: "2024-04-04", sasoon: 242, rubyHall: 260 },
  { date: "2024-04-05", sasoon: 373, rubyHall: 290 },
  { date: "2024-04-06", sasoon: 301, rubyHall: 340 },
  { date: "2024-04-07", sasoon: 245, rubyHall: 180 },
  { date: "2024-04-08", sasoon: 409, rubyHall: 320 },
  // ... rest of your data
]

const chartConfig = {
  views: {
    label: "Number of Patients",
    color: "#000000", // Default color for views
  },
  sasoon: {
    label: "Sasoon Clinic",
    color: "#FF5722", // Vibrant Orange for Sasoon Clinic
  },
  rubyHall: {
    label: "Ruby Hall Clinic",
    color: "#007BFF", // Vibrant Blue for Ruby Hall Clinic
  },
} satisfies ChartConfig

export function AdminBarChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("sasoon")

  const total = React.useMemo(
    () => ({
      sasoon: chartData.reduce((acc, curr) => acc + curr.sasoon, 0),
      rubyHall: chartData.reduce((acc, curr) => acc + curr.rubyHall, 0),
    }),
    []
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Patient Visits</CardTitle>
          <CardDescription>
            Showing total patient visits for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          {["sasoon", "rubyHall"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={chartConfig[activeChart].color} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}