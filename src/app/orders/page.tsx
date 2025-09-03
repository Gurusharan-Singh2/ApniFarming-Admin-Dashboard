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
import axios from "axios"
import dayjs from "dayjs"

type Order = {
  id: number
  uid: number
  firstName: string
  email: string | null
  phone: string
  paymentMethod: string
  totalPrice: string
  tax: string
  shippingPrice: string
  couponCode: string
  discount: string
  shippingAddress: string
  shippingCity: string
  shippingPostalCode: string
  deliveryDate: string
  deliveryFromTime: string
  deliveryToTime: string
  shippingState: string
  shippingCountry: string
  driverId: number | null
  orderStatus: string
  createdAt: string
  updatedAt: string
  deliveryInstruction: string
  driverName: string | null
  driverPhoneNumber: string | null
  paymentStatus: string
  totalReceivedAmount: string
}

type OrderItem = {
  id: number
  order_id: number
  product_id: number
  product_name: string
  product_qty: string
  sale_price: string
  mrp: string
  variant_id: number
  variant_name: string
  customize?: string
}

const fetchOrders = async (): Promise<Order[]> => {
  const response = await axios.get(
    "https://api.apnifarming.com/user/admin/orderlist.php"
  )
  return (
    response?.data?.orders?.map((o: any) => ({
      id: o.id,
      uid: o.uid,
      firstName: o.first_name,
      email: o.email,
      phone: o.phone,
      paymentMethod: o.payment_method,
      totalPrice: o.total_price,
      tax: o.tax,
      shippingPrice: o.shipping_price,
      couponCode: o.coupon_code,
      discount: o.discount,
      shippingAddress: o.shipping_address,
      shippingCity: o.shipping_city,
      shippingPostalCode: o.shipping_postalcode,
      deliveryDate: o.delivery_date,
      deliveryFromTime: o.delivery_from_time,
      deliveryToTime: o.delivery_to_time,
      shippingState: o.shipping_state,
      shippingCountry: o.shipping_country,
      driverId: o.driver_id,
      orderStatus: o.order_status,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      deliveryInstruction: o.delivey_instruction,
      driverName: o.driver_name,
      driverPhoneNumber: o.driver_phone_number,
      paymentStatus: o.payment_status,
      totalReceivedAmount: o.total_recived_amount,
    })) ?? []
  )
}

const fetchOrderItems = async (id: number): Promise<OrderItem[]> => {
  const response = await axios.post(
    "https://api.apnifarming.com/user/admin/orderdetail.php",
    { order_id: id }
  )
  return response?.data?.items ?? []
}

const changeOrderStatuses = async ({
  orderIds,
  status,
}: {
  orderIds: number[]
  status: number
}) => {
  await axios.post(
    "https://api.apnifarming.com/user/admin/changeorderstaus.php",
    {
      order_ids: orderIds,
      order_status: status,
    }
  )
}
export default function OrdersComponent() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("date")

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  })

  const mutation = useMutation({
  mutationFn: changeOrderStatuses,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
})

  const filteredOrders = orders
    ?.filter((o) =>
      o.firstName?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "status")
        return a.orderStatus.localeCompare(b.orderStatus)
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    })

  const statusColors: Record<string, string> = {
    "order processed": "bg-blue-500",
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
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Input
            placeholder="Search by customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-[200px]"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="max-h-[70vh] space-y-4">
          {filteredOrders?.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <p className="font-medium">{order?.firstName}</p>
                  <p className="text-sm text-muted-foreground">
                    {dayjs(order.deliveryDate).format("DD MMM YYYY")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                  <Badge
                    className={
                      statusColors[order?.orderStatus?.toLowerCase()] || ""
                    }
                  >
                    {order?.orderStatus}
                  </Badge>

                 <Select
  value={order?.orderStatus}
  onValueChange={(value) => {
    const statusMap: Record<string, number> = {
      "order_processed": 1,
      "order_confirmed": 2,
      "out_for_delivery": 3,
      "delivered": 4,
      "refunded": 8,
      "cancelled": 9,
    }

    mutation.mutate({
      orderIds: [order.id],
      status: statusMap[value],
    })
  }}
>
  <SelectTrigger className="w-[150px] sm:w-[160px]">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="order_processed">Order Processed</SelectItem>
    <SelectItem value="order_confirmed">Order Confirmed</SelectItem>
    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
    <SelectItem value="delivered">Delivered</SelectItem>
    <SelectItem value="refunded">Refunded</SelectItem>
    <SelectItem value="cancelled">Cancelled</SelectItem>
  </SelectContent>
</Select>


                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        More Info
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-2 text-sm">
                        <p><strong>Order ID:</strong> {order.id}</p>
                        <p><strong>User ID:</strong> {order.uid}</p>
                        <p><strong>Customer Name:</strong> {order.firstName}</p>
                        <p><strong>Email:</strong> {order.email || "N/A"}</p>
                        <p><strong>Phone:</strong> {order.phone}</p>
                        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                        <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                        <p><strong>Total Price:</strong> {order.totalPrice}</p>
                        <p><strong>Tax:</strong> {order.tax}</p>
                        <p><strong>Discount:</strong> {order.discount}</p>
                        <p><strong>Shipping Price:</strong> {order.shippingPrice}</p>
                        <p><strong>Coupon Code:</strong> {order.couponCode || "N/A"}</p>
                        <p><strong>Total Received Amount:</strong> {order.totalReceivedAmount}</p>
                        <p><strong>Order Status:</strong> {order.orderStatus}</p>
                        <p><strong>Delivery Date:</strong> {dayjs(order.deliveryDate).format("DD MMM YYYY")}</p>
                        <p><strong>Delivery Time:</strong> {dayjs(order.deliveryFromTime, "HH:mm:ss").format("hh:mm A")} - {dayjs(order.deliveryToTime, "HH:mm:ss").format("hh:mm A")}</p>
                        <p><strong>Delivery Instruction:</strong> {order.deliveryInstruction || "N/A"}</p>
                        <p><strong>Shipping Address:</strong> {order.shippingAddress}, {order.shippingCity}, {order.shippingState}, {order.shippingCountry}, {order.shippingPostalCode}</p>
                        <p><strong>Driver:</strong> {order.driverName || "Not Assigned"}</p>
                        <p><strong>Driver Phone:</strong> {order.driverPhoneNumber || "N/A"}</p>
                        <p><strong>Created At:</strong> {dayjs(order.createdAt).format("DD MMM YYYY, hh:mm A")}</p>
                        <p><strong>Updated At:</strong> {dayjs(order.updatedAt).format("DD MMM YYYY, hh:mm A")}</p>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        View Items
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Items</DialogTitle>
                      </DialogHeader>
                      <OrderItems orderId={order.id} />
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

function OrderItems({ orderId }: { orderId: number }) {
  const { data: items, isLoading, isError } = useQuery<OrderItem[]>({
    queryKey: ["order-items", orderId],
    queryFn: () => fetchOrderItems(orderId),
  })

  if (isLoading) return <p>Loading items...</p>
  if (isError) return <p className="text-red-500 text-sm">Failed to load items.</p>
  if (!items || items.length === 0)
    return <p className="text-muted-foreground text-sm">No items available</p>

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center border rounded-lg p-2 gap-2"
        >
          <div>
            <p className="font-medium">{item.product_name}</p>
            <p className="text-xs text-muted-foreground">
              {item.variant_name} • Qty: {item.product_qty}
            </p>
            {item.customize && (
              <p className="text-xs italic text-muted-foreground">
                Note: {item.customize}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold">₹{item.sale_price}</p>
            {item.mrp !== item.sale_price && (
              <p className="line-through text-xs text-muted-foreground">
                ₹{item.mrp}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
