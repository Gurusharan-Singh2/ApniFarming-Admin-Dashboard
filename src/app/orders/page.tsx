"use client"

import React, { useState, useMemo, useCallback, useRef } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
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
import { useVirtualizer } from "@tanstack/react-virtual"

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

const statusMap: Record<string, { label: string; code: number }> = {
  "order processed": { label: "Order Processed", code: 1 },
  "ordered": { label: "Order Confirmed", code: 2 },
  "delivering": { label: "Out for Delivery", code: 3 },
  "delivered": { label: "Delivered", code: 4 },
  "refunded": { label: "Refunded", code: 8 },
  "cancelled": { label: "Cancelled", code: 9 },
}

const statusColors: Record<string, string> = {
  "order processed": "bg-blue-500 text-white",
  "ordered": "bg-indigo-500 text-white",
  "delivering": "bg-yellow-500 text-black",
  "delivered": "bg-green-600 text-white",
  "cancelled": "bg-red-600 text-white",
  "refunded": "bg-purple-600 text-white",
}

export default function OrdersComponent() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  })

  const mutation = useMutation({
    mutationFn: changeOrderStatuses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setSelectedOrders([])
    },
    onError: (error) => {
      console.error("Failed to update status", error)
    },
  })

  const toggleOrderSelection = useCallback((id: number) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    )
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (orders && selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else if (orders) {
      setSelectedOrders(orders.map((o) => o.id))
    }
  }, [orders, selectedOrders])

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    let data = [...orders]
    if (search) {
      data = data.filter((o) =>
        o.firstName?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (sortBy === "status") {
      data.sort((a, b) => a.orderStatus.localeCompare(b.orderStatus))
    } else {
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }
    return data
  }, [orders, search, sortBy])

  // ✅ Virtualization
  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: filteredOrders.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // avg row height
  })

  if (isLoading) return <p>Loading orders...</p>
  if (isError) return <p className="text-red-500">Failed to fetch orders.</p>

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

        {/* ✅ Bulk status update */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-muted-foreground">
              {selectedOrders.length} orders selected
            </p>
            <Select
              onValueChange={(value) => {
                const statusEntry = statusMap[value]
                if (!statusEntry) return
                mutation.mutate({
                  orderIds: selectedOrders,
                  status: statusEntry.code,
                })
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Bulk update status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusMap).map(([key, s]) => (
                  <SelectItem key={key} value={key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ✅ Virtualized List */}
        <div
          ref={parentRef}
          className="max-h-[70vh] overflow-auto border rounded-md"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const order = filteredOrders[virtualRow.index]
              return (
                <div
                  key={order.id}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <OrderRow
                    order={order}
                    selected={selectedOrders.includes(order.id)}
                    toggleOrderSelection={toggleOrderSelection}
                    mutation={mutation}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ===============================
   ✅ Memoized Order Row Component
   =============================== */
const OrderRow = React.memo(function OrderRow({
  order,
  selected,
  toggleOrderSelection,
  mutation,
}: {
  order: Order
  selected: boolean
  toggleOrderSelection: (id: number) => void
  mutation: any
}) {
  const statusKey = order?.orderStatus?.toLowerCase()
  const statusInfo = statusMap[statusKey]

  return (
    <Card className="p-4 m-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selected}
            onCheckedChange={() => toggleOrderSelection(order.id)}
          />
          <div>
            <p className="font-medium">{order?.firstName}</p>
            <p className="text-sm text-muted-foreground">
              {dayjs(order.deliveryDate).format("DD MMM YYYY")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Badge
            className={statusColors[statusKey] || "bg-gray-500 text-white"}
          >
            {statusInfo?.label || order?.orderStatus}
          </Badge>

          <Select
            value={statusKey}
            onValueChange={(value) => {
              if (statusKey === value) return
              const statusEntry = statusMap[value]
              if (!statusEntry) return
              mutation.mutate({
                orderIds: [order.id],
                status: statusEntry.code,
              })
            }}
          >
            <SelectTrigger className="w-[150px] sm:w-[160px]">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusMap).map(([key, s]) => (
                <SelectItem key={key} value={key}>
                  {s.label}
                </SelectItem>
              ))}
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
                <p><strong>Order Status:</strong> {statusInfo?.label || order.orderStatus}</p>
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
  )
})

/* ===============================
   ✅ Order Items Component
   =============================== */
function OrderItems({ orderId }: { orderId: number }) {
  const { data: items } = useQuery<OrderItem[]>({
    queryKey: ["order-items", orderId],
    queryFn: () => fetchOrderItems(orderId),
  })

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
