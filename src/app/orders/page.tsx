"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import axios from "axios";
import dayjs from "dayjs";
import { Loader } from "@/components/Loader";

type Order = {
  id: number;
  uid: number;
  firstName: string;
  email: string | null;
  phone: string;
  paymentMethod: string;
  totalPrice: string;
  tax: string;
  shippingPrice: string;
  couponCode: string;
  discount: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  deliveryDate: string;
  deliveryFromTime: string;
  deliveryToTime: string;
  shippingState: string;
  shippingCountry: string;
  driverId: number | null;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  deliveryInstruction: string;
  driverName: string | null;
  driverPhoneNumber: string | null;
  paymentStatus: string;
  totalReceivedAmount: string;
};

type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_qty: string;
  sale_price: string;
  mrp: string;
  variant_id: number;
  variant_name: string;
  customize?: string;
};

const fetchSlots = async () => {
  const res = await axios.get("https://api.apnifarming.com/user/admin/getAllslot.php");
  return res.data?.data ?? [];
};

const fetchOrders = async ({
  queryKey,
}: {
  queryKey: any;
}): Promise<{ orders: Order[]; totalPages: number }> => {
  const [_key, page, limit, filters] = queryKey;

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.uid ? { uid: String(filters.uid) } : {}),
    ...(filters.phone ? { phone: filters.phone } : {}),
    ...(filters.orderId ? { order_id: String(filters.orderId) } : {}),
    ...(filters.dateFrom ? { date_from: filters.dateFrom } : {}),
    ...(filters.dateTo ? { date_to: filters.dateTo } : {}),
    ...(filters.slot ? { slot: filters.slot } : {}),
    ...(filters.driverId ? { driver_id: String(filters.driverId) } : {}),
    ...(filters.orderStatus ? { order_status: String(filters.orderStatus) } : {}),
    ...(filters.paymentStatus ? { payment_status: String(filters.paymentStatus) } : {}),
  });

  const response = await axios.get(
    `https://api.apnifarming.com/user/admin/orderlist.php?${params.toString()}`
  );

  return {
    orders:
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
      })) ?? [],
    totalPages: response?.data?.total_pages ?? 1,
  };
};

const fetchOrderItems = async (id: number): Promise<OrderItem[]> => {
  const response = await axios.post(
    "https://api.apnifarming.com/user/admin/orderdetail.php",
    { order_id: id }
  );
  return response?.data?.items ?? [];
};

const changeOrderStatuses = async ({
  orderIds,
  status,
}: {
  orderIds: number[];
  status: number;
}) => {
  await axios.post(
    "https://api.apnifarming.com/user/admin/changeorderstaus.php",
    {
      order_ids: orderIds,
      order_status: status,
    }
  );
};

const changePaymentStatus = async ({
  orderId,
  paymentStatus,
  totalReceivedAmount,
}: {
  orderId: number;
  paymentStatus: number;
  totalReceivedAmount: number;
}) => {
  await axios.post("https://api.apnifarming.com/user/admin/changepaymentstaus.php", {
    orders: [
      {
        order_id: orderId,
        payment_status: paymentStatus,
        total_received_amount: totalReceivedAmount,
      },
    ],
  });
};

const statusMap: Record<string, { label: string; code: number }> = {
  "order processed": { label: "Order Processed", code: 1 },
  "order confirmed": { label: "Order Confirmed", code: 2 },
  "out for delivery": { label: "Out for Delivery", code: 3 },
  delivered: { label: "Delivered", code: 4 },
  refunded: { label: "Refunded", code: 8 },
  cancelled: { label: "Cancelled", code: 9 },
};

const paymentStatusLabels: Record<string, string> = {
  "0": "Unpaid",
  "1": "Paid",
  "2": "Pending",
};
const statusColors: Record<string, string> = {
  "order processed": "bg-blue-500 text-white",
  "order confirmed": "bg-indigo-500 text-white",
  "out for delivery": "bg-yellow-500 text-black",
  delivered: "bg-green-600 text-white",
  cancelled: "bg-red-600 text-white",
  refunded: "bg-purple-600 text-white",
};

export default function OrdersComponent() {
  const queryClient = useQueryClient();
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);

  const [filters, setFilters] = useState({
    search: "",
    uid: "",
    phone: "",
    orderId: "",
    dateFrom: "",
    dateTo: "",
    slot: "",
    driverId: "",
    orderStatus: "",
    paymentStatus: "",
  });

   const { data: slots = [], isLoading: slotLoading } = useQuery({
    queryKey: ["slots"],
    queryFn: fetchSlots,
  });

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["orders", page, limit, filters],
    queryFn: fetchOrders,
    placeholderData: { orders: [], totalPages: 1 },
  });

  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;

  const Ordermutation = useMutation({
    mutationFn: changeOrderStatuses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrders([]);
    },
    onError: (error) => {
      console.error("Failed to update status", error);
    },
  });

  const PaymentMutation = useMutation({
    mutationFn: changePaymentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Failed to update payment status", error);
    },
  });

  const toggleOrderSelection = useCallback((id: number) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  }, []);

  if (isFetching) return <Loader/>;
  if (isError) return <p className="text-red-500">Failed to fetch orders.</p>;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="Search by name / phone / order ID"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-[300px]"
            />

            <Input
              placeholder="Phone"
              value={filters.phone}
              onChange={(e) => setFilters((f) => ({ ...f, phone: e.target.value }))}
              className="w-[180px]"
            />

            <Input
              type="number"
              placeholder="Order ID"
              value={filters.orderId}
              onChange={(e) => setFilters((f) => ({ ...f, orderId: e.target.value }))}
              className="w-[160px]"
            />

            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="w-[170px]"
              placeholder="Created To"
            />

            <Select
              value={filters.orderStatus}
              onValueChange={(value) => setFilters((f) => ({ ...f, orderStatus: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusMap).map(([key, s]) => (
                  <SelectItem key={key} value={s.code.toString()}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.paymentStatus}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, paymentStatus: value }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Unpaid</SelectItem>
                <SelectItem value="1">Paid</SelectItem>
                <SelectItem value="2">Pending</SelectItem>
              </SelectContent>
            </Select>


<Select
  value={filters.slot}
  onValueChange={(value) => setFilters((f) => ({ ...f, slot: value }))}
>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Filter by Slot" />
  </SelectTrigger>
  <SelectContent>
    {slotLoading ? (
      <SelectItem value="">Loading...</SelectItem>
    ) : (
      slots.map((slot: any) => (
        <SelectItem key={slot.id} value={slot.start_time}>
          {slot.title} ({slot.start_time} - {slot.end_time})
        </SelectItem>
      ))
    )}
  </SelectContent>
</Select>



            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  search: "",
                  uid: "",
                  phone: "",
                  orderId: "",
                  dateFrom: "",
                  dateTo: "",
                  slot: "",
                  driverId: "",
                  orderStatus: "",
                  paymentStatus: "",
                })
              }
            >
              Reset Filters
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Limit:</label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setLimit(val);
                setPage(1);
              }}
              className="w-20"
              min={1}
            />
          </div>
        </div>

        {/* Orders list */}

       

        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              selected={selectedOrders.includes(order.id)}
              toggleOrderSelection={toggleOrderSelection}
              mutation={Ordermutation}
              paymentMutation={PaymentMutation}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <p className="text-sm">
            Page {page} of {totalPages}
          </p>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const OrderRow = React.memo(function OrderRow({
  order,
  selected,
  toggleOrderSelection,
  mutation,
  paymentMutation,
}: {
  order: Order;
  selected: boolean;
  toggleOrderSelection: (id: number) => void;
  mutation: any;
  paymentMutation: any;
}) {
  const statusKey = order?.orderStatus?.toLowerCase();
  const statusInfo = statusMap[statusKey];
  const [openPayment, setOpenPayment] = useState(false);

    const totalPrice = parseFloat(order.totalPrice) || 0;
  const received = parseFloat(order.totalReceivedAmount) || 0;
  const pending = Math.max(totalPrice - received, 0);

  return (
    <Card className="p-4 w-full min-h-[100px]">
      <div className="flex justify-between items-start gap-3 flex-wrap">
        {/* Left Section */}
        <div className="flex items-center gap-14 min-w-[140px]">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selected}
              onCheckedChange={() => toggleOrderSelection(order.id)}
            />
            <div>
              <p className="font-medium">{order?.firstName}</p>
              <p className="text-sm text-muted-foreground">
                {dayjs(order.createdAt).format("DD MMM YYYY")}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm">Phone: {order.phone}</p>
            <p className="text-sm">Address: {order.shippingAddress}</p>
              <p className="text-sm">
              Payment Status: {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
            </p>
            <p className="text-sm">
              <strong>Pending:</strong> ₹{pending}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-row justify-end items-center gap-2 flex-wrap">
          <Badge className={statusColors[statusKey] || "bg-gray-500 text-white"}>
            {statusInfo?.label || order?.orderStatus}
          </Badge>

          {/* Change order status */}
          <Select
            value={statusKey}
            disabled={mutation.isPending}
            onValueChange={(value) => {
              const statusEntry = statusMap[value];
              if (!statusEntry) return;
              mutation.mutate({ orderIds: [order.id], status: statusEntry.code });
            }}
          >
            <SelectTrigger className="w-[160px]">
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

          {/* Update payment status via modal */}
          <Dialog open={openPayment} onOpenChange={setOpenPayment}>
          <DialogTrigger asChild>
            <Button variant="outline">Update Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Payment</DialogTitle>
            </DialogHeader>
            <PaymentForm
              order={order}
              paymentMutation={paymentMutation}
              onClose={() => setOpenPayment(false)}
            />
          </DialogContent>
        </Dialog>

          {/* More Info */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="min-w-[100px]">
                More Info
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>
              <OrderDetails order={order} />
            </DialogContent>
          </Dialog>

          {/* Items */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="min-w-[100px]">
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
  );
});

function PaymentForm({
  order,
  paymentMutation,
  onClose,
}: {
  order: Order;
  paymentMutation: any;
  onClose: () => void;
}) {
  const totalPrice = parseFloat(order.totalPrice) || 0;
  const alreadyReceived = parseFloat(order.totalReceivedAmount) || 0;
  const pendingAmount = Math.max(totalPrice - alreadyReceived, 0);

  const [status, setStatus] = useState(pendingAmount === 0 ? "1" : "0");
  const [receivedAmount, setReceivedAmount] = useState(alreadyReceived.toString());

  // Auto-fill receivedAmount if user selects Paid
  const handleStatusChange = (val: string) => {
    setStatus(val);
    if (val === "1") {
      setReceivedAmount(totalPrice.toString()); // fill total received amount
    }
  };

  const handleSave = () => {
    paymentMutation.mutate(
      {
        orderId: order.id,
        paymentStatus: parseInt(status),
        totalReceivedAmount: parseFloat(receivedAmount) || 0,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Unpaid</SelectItem>
          <SelectItem value="1">Paid</SelectItem>
        </SelectContent>
      </Select>

      {/* Only show input if status is Paid */}
      {status === "1" && (
        <Input
          type="number"
          value={pendingAmount}
          onChange={(e) => setReceivedAmount(e.target.value)}
          placeholder="Enter received amount"
        />
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={paymentMutation.isPending}>
          {paymentMutation.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}





// ✅ Order Details
function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>Name:</strong> {order.firstName}</p>
      <p><strong>Phone:</strong> {order.phone}</p>
      <p><strong>Email:</strong> {order.email ?? "-"}</p>
      <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
      <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
      <p><strong>Received Amount:</strong> ₹{order.totalReceivedAmount}</p>
      <p><strong>Address:</strong> {order.shippingAddress}, {order.shippingCity}</p>
      <p><strong>Status:</strong> {order.orderStatus}</p>
      <p><strong>Created At:</strong> {dayjs(order.createdAt).format("DD MMM YYYY HH:mm")}</p>
    </div>
  );
}

// ✅ Order Items
function OrderItems({ orderId }: { orderId: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["orderItems", orderId],
    queryFn: () => fetchOrderItems(orderId),
  });

  if (isLoading) return <p>Loading items...</p>;
  if (isError) return <p className="text-red-500">Failed to fetch items</p>;

  return (
    <div className="flex flex-col gap-2">
      {data?.map((item) => (
        <div
          key={item.id}
          className="p-3 border rounded-md flex justify-between items-center"
        >
          <div>
            <p className="font-medium">{item.product_name}</p>
            <p className="text-sm text-muted-foreground">
              Qty: {item.product_qty} | Variant: {item.variant_name}
            </p>
          </div>
          <p className="font-semibold">₹{item.sale_price}</p>
        </div>
      ))}
    </div>
  );
}

