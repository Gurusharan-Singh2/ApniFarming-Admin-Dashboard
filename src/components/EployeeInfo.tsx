"use client"

import * as React from "react"
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
} from "@/components/ui/select"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type Department = "development" | "marketing"

// Dummy data generator
const generateEmployees = (department: Department, month: string) => {
  const names = [
    "Gurusharan Singh", "Priya Sharma", "Ravi Kumar", "Anjali Mehta", "Aryan Kapoor"
  ]
  const roles :Record<Department, string[]> = {
    development: ["App Developer", "Web Developer", "Full Stack Developer"],
    marketing: ["Content Writer", "SEO Specialist", "Social Media Manager"]
  }

  return names.map((name, i) => ({
    id: i + 1,
    name,
    role: roles[department][i % roles[department].length],
    avatar: `https://randomuser.me/api/portraits/men/${i + 10}.jpg`,
    joiningMonth: month
  }))
}

const departments: Department[] = ["development", "marketing"]
const months = ["2024-06", "2024-07", "2024-08"]

export function EmployeeCards() {
  const [department, setDepartment] = React.useState<Department>("development")
  const [month, setMonth] = React.useState("2024-06")

  const employees = React.useMemo(
    () => generateEmployees(department, month),
    [department, month]
  )

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-xl font-semibold">Employee Directory</CardTitle>
        <div className="flex flex-wrap gap-3">
          <Select value={department} onValueChange={(value) => setDepartment(value as Department)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dep => (
                <SelectItem key={dep} value={dep}>{dep}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <Separator />

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          {employees.map(emp => (
            <Card key={emp.id} className="p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition">
              <Avatar className="w-14 h-14">
                <AvatarImage src={emp.avatar} alt={emp.name} />
                <AvatarFallback>{emp.name.split(" ")[0][0]}{emp.name.split(" ")[1]?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{emp.name}</p>
                <p className="text-sm text-muted-foreground">{emp.role}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  Joined: {emp.joiningMonth}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
