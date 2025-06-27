"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

const chartData = [
  { month: "January", revenue: 10000, used: 6000 },
  { month: "February", revenue: 9000, used: 4000 },
  { month: "March", revenue: 7000, used: 8000 },
  { month: "April", revenue: 11000, used: 6500 },
  { month: "May", revenue: 9500, used: 10500 },
  { month: "June", revenue: 12000, used: 8500 },
]

export function RevenueLineChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Revenue vs Expenses</CardTitle>
        <CardDescription>Monthly trends for the first half of 2024</CardDescription>
      </CardHeader>

      <CardContent className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#4f46e5" name="Revenue" />
            <Line type="monotone" dataKey="used" stroke="#f59e0b" name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
