"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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

const chartData = [
    { month: "January", sasoon: 190, rubyHall: 150 },
    { month: "February", sasoon: 245, rubyHall: 230 },
    { month: "March", sasoon: 300, rubyHall: 210 },
    { month: "April", sasoon: 150, rubyHall: 190 },
    { month: "May", sasoon: 200, rubyHall: 250 },
    { month: "June", sasoon: 220, rubyHall: 300 },
]

const chartConfig = {
    sasoon: {
        label: "Sasoon Clinic",
        color: "hsl(var(--chart-1))",
    },
    rubyHall: {
        label: "Ruby Hall Clinic",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function AdminLineChart() {
    return (
        <Card style={{ height: '390px' }}>
            <CardHeader>
                <CardTitle>Line Chart - Patient Visits</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="mt-8">
                <ChartContainer config={chartConfig}>
                    <LineChart
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
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                            dataKey="sasoon"
                            type="linear"
                            stroke="var(--color-sasoon)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="rubyHall"
                            type="linear"
                            stroke="var(--color-rubyHall)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total patients for the last 6 months
                </div>
            </CardFooter>
        </Card>
    )
}