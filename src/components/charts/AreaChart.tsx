"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select"
import { ChartContainer } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { saveAs } from "file-saver"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

// Utility to generate dummy data
const generateMonthlyData = (category: string, month: string) => {
  const start = new Date(`${month}-01`)
  return Array.from({ length: 30 }).map((_, i) => {
    const date = new Date(start)
    date.setDate(i + 1)
    const formattedDate = date.toISOString().split("T")[0]

    if (category === "fruits") {
      return {
        date: formattedDate,
        apple: Math.floor(Math.random() * 100 + 50),
        banana: Math.floor(Math.random() * 100 + 40),
        mango: Math.floor(Math.random() * 100 + 60),
      }
    } else {
      return {
        date: formattedDate,
        milk: Math.floor(Math.random() * 100 + 100),
        curd: Math.floor(Math.random() * 100 + 60),
        butter: Math.floor(Math.random() * 100 + 30),
      }
    }
  })
}

const colorPalette = [
  "#5A67D8", // blue
  "#F6AD55", // orange
  "#68D391", // green
  "#FC8181", // red
  "#9F7AEA", // purple
  "#FBD38D", // light orange
]

const months = ["2024-06", "2024-07", "2024-08"]

export function AreaChartt() {
  const [category, setCategory] = React.useState("fruits")
  const [month, setMonth] = React.useState("2024-06")
  const [zoom, setZoom] = React.useState(1)
  const chartRef = React.useRef(null)

  const data = React.useMemo(() => generateMonthlyData(category, month), [category, month])

  const chartConfig = React.useMemo(() => {
    if (!data.length) return {}
    const keys = Object.keys(data[0]).filter((key) => key !== "date")
    return keys.reduce((acc, key, index) => {
      acc[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        color: colorPalette[index % colorPalette.length],
      }
      return acc
    }, {} as Record<string, { label: string; color: string }>)
  }, [data])

  const exportToCSV = () => {
    const keys = Object.keys(data[0])
    const csvHeader = ["Date", ...keys.filter(k => k !== "date").map(k => chartConfig[k]?.label || k)]
    const csvRows = data.map(d => keys.map(k => d[k as keyof typeof d]).join(","))
    const csvContent = [csvHeader.join(","), ...csvRows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, `data-${category}-${month}.csv`)
  }

  const exportToPDF = async () => {
    if (!chartRef.current) return
    const canvas = await html2canvas(chartRef.current)
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const pageWidth = pdf.internal.pageSize.getWidth()
    const chartWidth = 180
    const x = (pageWidth - chartWidth) / 2
    pdf.text(`Sales Chart - ${category} - ${month}`, 10, 10)
    pdf.addImage(imgData, "PNG", x, 20, chartWidth, 100)
    pdf.save(`chart-${category}-${month}.pdf`)
  }

  return (
    <Card>
      <CardHeader className="flex flex-wrap gap-4 items-center justify-between">
        <CardTitle>Sales Chart</CardTitle>
        <div className="flex gap-2 flex-wrap">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["fruits", "milk"].map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setZoom(zoom === 1 ? 2 : 1)}>
            {zoom === 1 ? "Zoom In" : "Zoom Out"}
          </Button>
          <Button onClick={exportToCSV}>Export CSV</Button>
          <Button onClick={exportToPDF}>Export PDF</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="overflow-x-auto">
          <div style={{ minWidth: zoom === 1 ? "1200px" : "600px" }}>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={data}>
                <defs>
                  {Object.entries(chartConfig).map(([key, { color }]) => (
                    <linearGradient key={key} id={`fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={50} />
                <Tooltip
                  formatter={(value, name) => {
                    const label = (name as string).charAt(0).toUpperCase() + (name as string).slice(1)
                    return [`${value}`, label]
                  }}
                />
                <Legend />
                {Object.entries(chartConfig).map(([key, { color }]) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    fill={`url(#fill-${key})`}
                    stackId="1"
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
