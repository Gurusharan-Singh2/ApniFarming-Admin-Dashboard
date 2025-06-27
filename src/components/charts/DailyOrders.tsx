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

export const description = "An interactive bar chart"

const dailyOrders = [
  { date: "2024-04-01", totalOrders: 372 },
  { date: "2024-04-02", totalOrders: 277 },
  { date: "2024-04-03", totalOrders: 287 },
  { date: "2024-04-04", totalOrders: 502 },
  { date: "2024-04-05", totalOrders: 663 },
  { date: "2024-04-06", totalOrders: 641 },
  { date: "2024-04-07", totalOrders: 425 },
  { date: "2024-04-08", totalOrders: 729 },
  { date: "2024-04-09", totalOrders: 169 },
  { date: "2024-04-10", totalOrders: 451 },
  { date: "2024-04-11", totalOrders: 677 },
  { date: "2024-04-12", totalOrders: 502 },
  { date: "2024-04-13", totalOrders: 722 },
  { date: "2024-04-14", totalOrders: 357 },
  { date: "2024-04-15", totalOrders: 290 },
  { date: "2024-04-16", totalOrders: 328 },
  { date: "2024-04-17", totalOrders: 806 },
  { date: "2024-04-18", totalOrders: 774 },
  { date: "2024-04-19", totalOrders: 423 },
  { date: "2024-04-20", totalOrders: 239 },
  { date: "2024-04-21", totalOrders: 337 },
  { date: "2024-04-22", totalOrders: 394 },
  { date: "2024-04-23", totalOrders: 368 },
  { date: "2024-04-24", totalOrders: 677 },
  { date: "2024-04-25", totalOrders: 465 },
  { date: "2024-04-26", totalOrders: 205 },
  { date: "2024-04-27", totalOrders: 803 },
  { date: "2024-04-28", totalOrders: 302 },
  { date: "2024-04-29", totalOrders: 555 },
  { date: "2024-04-30", totalOrders: 834 },
  { date: "2024-05-01", totalOrders: 385 },
  { date: "2024-05-02", totalOrders: 603 },
  { date: "2024-05-03", totalOrders: 437 },
  { date: "2024-05-04", totalOrders: 805 },
  { date: "2024-05-05", totalOrders: 871 },
  { date: "2024-05-06", totalOrders: 1018 },
  { date: "2024-05-07", totalOrders: 688 },
  { date: "2024-05-08", totalOrders: 359 },
  { date: "2024-05-09", totalOrders: 407 },
  { date: "2024-05-10", totalOrders: 623 },
  { date: "2024-05-11", totalOrders: 605 },
  { date: "2024-05-12", totalOrders: 437 },
  { date: "2024-05-13", totalOrders: 357 },
  { date: "2024-05-14", totalOrders: 938 },
  { date: "2024-05-15", totalOrders: 853 },
  { date: "2024-05-16", totalOrders: 738 },
  { date: "2024-05-17", totalOrders: 919 },
  { date: "2024-05-18", totalOrders: 665 },
  { date: "2024-05-19", totalOrders: 415 },
  { date: "2024-05-20", totalOrders: 407 },
  { date: "2024-05-21", totalOrders: 222 },
  { date: "2024-05-22", totalOrders: 201 },
  { date: "2024-05-23", totalOrders: 542 },
  { date: "2024-05-24", totalOrders: 514 },
  { date: "2024-05-25", totalOrders: 451 },
  { date: "2024-05-26", totalOrders: 383 },
  { date: "2024-05-27", totalOrders: 880 },
  { date: "2024-05-28", totalOrders: 423 },
  { date: "2024-05-29", totalOrders: 208 },
  { date: "2024-05-30", totalOrders: 620 },
  { date: "2024-05-31", totalOrders: 408 },
  { date: "2024-06-01", totalOrders: 378 },
  { date: "2024-06-02", totalOrders: 880 },
  { date: "2024-06-03", totalOrders: 263 },
  { date: "2024-06-04", totalOrders: 819 },
  { date: "2024-06-05", totalOrders: 228 },
  { date: "2024-06-06", totalOrders: 544 },
  { date: "2024-06-07", totalOrders: 693 },
  { date: "2024-06-08", totalOrders: 705 },
  { date: "2024-06-09", totalOrders: 918 },
  { date: "2024-06-10", totalOrders: 355 },
  { date: "2024-06-11", totalOrders: 242 },
  { date: "2024-06-12", totalOrders: 912 },
  { date: "2024-06-13", totalOrders: 211 },
  { date: "2024-06-14", totalOrders: 806 },
  { date: "2024-06-15", totalOrders: 657 },
  { date: "2024-06-16", totalOrders: 681 },
  { date: "2024-06-17", totalOrders: 995 },
  { date: "2024-06-18", totalOrders: 277 },
  { date: "2024-06-19", totalOrders: 631 },
  { date: "2024-06-20", totalOrders: 858 },
  { date: "2024-06-21", totalOrders: 379 },
  { date: "2024-06-22", totalOrders: 587 },
  { date: "2024-06-23", totalOrders: 1010 },
  { date: "2024-06-24", totalOrders: 312 },
  { date: "2024-06-25", totalOrders: 331 },
  { date: "2024-06-26", totalOrders: 814 },
  { date: "2024-06-27", totalOrders: 938 },
  { date: "2024-06-28", totalOrders: 349 },
  { date: "2024-06-29", totalOrders: 263 },
  { date: "2024-06-30", totalOrders: 846 }
];

const chartData = dailyOrders;

const chartConfig = {
  dailyOrders: {
    label: "Daily Orders",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function DailyOrders() {
  const [activeChart] = React.useState<keyof typeof chartConfig>("dailyOrders")

  const total = React.useMemo(() => {
    return {
      dailyOrders: chartData.reduce((acc, curr) => acc + curr.totalOrders, 0),
    }
  }, [])

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total orders for the last 3 months
          </CardDescription>
        </div>
        <div className="flex">
          <button
            data-active
            className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:px-8 sm:py-6"
          >
            <span className="text-muted-foreground text-xs">
              {chartConfig.dailyOrders.label}
            </span>
            <span className="text-lg leading-none font-bold sm:text-3xl">
              {total.dailyOrders.toLocaleString()}
            </span>
          </button>
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
                  nameKey="totalOrders"
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
            <Bar dataKey="totalOrders" fill="var(--chart-1)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
