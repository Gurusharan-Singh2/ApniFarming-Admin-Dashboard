"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// --- Replace this with actual API call in production ---
// GET /api/orders
// const fetchOrders = async (): Promise<Order[]> => {
//   const response = await fetch("/api/orders")
//   return await response.json()
// }

// PATCH /api/orders/:id
// const updateOrderStatus = async ({ id, status }: { id: string; status: string }) => {
//   await fetch(`/api/orders/${id}`, {
//     method: "PATCH",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ status }),
//   })
// }

const mockOrders = [
  {
    id: "1",
    customerName: "Alice Johnson",
    date: "2025-06-25T10:00:00Z",
    status: "ordered",
    items: ["Shirt", "Pants"],
  },
  {
    id: "2",
    customerName: "Bob Smith",
    date: "2025-06-24T14:30:00Z",
    status: "delivering",
    items: ["Shoes", "Socks"],
  },
  {
    id: "3",
    customerName: "Catherine Lee",
    date: "2025-06-23T09:15:00Z",
    status: "delivered",
    items: ["Hat", "Gloves"],
  },
]

type Order = {
  id: string
  customerName: string
  date: string
  status: string
  items: string[]
}

export default function OrdersComponent() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("date")

  const { data: orders = mockOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => mockOrders,
  })

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updated = orders.map((o) =>
        o.id === id ? { ...o, status } : o
      )
      queryClient.setQueryData(["orders"], updated)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  })

  const filteredOrders = orders
    .filter((o) =>
      o.customerName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "status") return a.status.localeCompare(b.status)
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  const statusColors: Record<string, string> = {
    ordered: "bg-blue-500",
    delivering: "bg-yellow-500",
    delivered: "bg-green-500",
    cancel: "bg-red-500",
  }

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4 flex-wrap">
          <Input
            placeholder="Search by customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[200px]"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="max-h-[500px] space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.date).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={statusColors[order.status] || ""}>{order.status}</Badge>
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      mutation.mutate({ id: order.id, status: value })
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordered">Ordered</SelectItem>
                      <SelectItem value="delivering">Delivering</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancel">Cancel</SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">View Items</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Items</DialogTitle>
                      </DialogHeader>
                      <ul className="list-disc pl-4">
                        {order.items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
