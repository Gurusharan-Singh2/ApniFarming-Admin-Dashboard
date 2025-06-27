"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Pie, PieChart, Tooltip, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const chartData = [
  { month: "January", revenue: 10000, used: 6000 },
  { month: "February", revenue: 9000, used: 4000 },
  { month: "March", revenue: 7000, used: 8000 },
  { month: "April", revenue: 11000, used: 6500 },
  { month: "May", revenue: 9500, used: 10500 },
  { month: "June", revenue: 12000, used: 8500 },
]

const profitColors = ["#34d399", "#10b981", "#059669"]
const lossColors = ["#f87171", "#ef4444", "#dc2626"]

const chartDataWithProfit = chartData.map((item, index) => {
  const profit = item.revenue - item.used
  const isProfit = profit >= 0
  const color = isProfit
    ? profitColors[index % profitColors.length]
    : lossColors[index % lossColors.length]

  return {
    ...item,
    amount: Math.abs(profit),
    type: isProfit ? "Profit" : "Loss",
    fill: color,
  }
})

export function RevenuePieChart() {
  const totalProfit = chartDataWithProfit
    .filter((d) => d.type === "Profit")
    .reduce((acc, d) => acc + d.amount, 0)

  const totalLoss = chartDataWithProfit
    .filter((d) => d.type === "Loss")
    .reduce((acc, d) => acc + d.amount, 0)

  const isUp = totalProfit >= totalLoss

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Profit & Loss Pie Chart</CardTitle>
        <CardDescription>Based on revenue vs. expenses (Jan–Jun 2024)</CardDescription>
      </CardHeader>

      <CardContent className="flex justify-center pb-0">
        <ResponsiveContainer width={300} height={300}>
          <PieChart>
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
            <Pie
              data={chartDataWithProfit}
              dataKey="amount"
              nameKey="month"
              label={({ name }) => name}
              outerRadius={100}
              isAnimationActive
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm mt-4">
        <div className="flex items-center gap-2 font-medium">
          {isUp ? (
            <>
              Net Profit ₹{(totalProfit - totalLoss).toLocaleString()}
              <TrendingUp className="h-4 w-4 text-green-500" />
            </>
          ) : (
            <>
              Net Loss ₹{(totalLoss - totalProfit).toLocaleString()}
              <TrendingDown className="h-4 w-4 text-red-500" />
            </>
          )}
        </div>
        <div className="text-muted-foreground">
          Monthly comparison of revenue and used expenses
        </div>
      </CardFooter>
    </Card>
  )
}
