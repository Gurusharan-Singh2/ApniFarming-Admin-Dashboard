// import OrdersPage from '@/components/orders/OrdersPage'
// import React from 'react'

// const page = () => {
//   return (
// <>

// <OrdersPage/>
// </>  )
// }

// export default page









"use client";


import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import debounce from "lodash.debounce";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
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
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { Loader } from "@/components/Loader";

// Types
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

// Fetchers & API calls
const fetchSlots = async () => {
  const res = await axios.get(
    "https://api.apnifarming.com/user/admin/getAllslot.php"
  );
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

// Status & labels
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

// --- Component ---
export default function OrdersComponent() {
  const queryClient = useQueryClient();
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);

const Fromtoday = dayjs().format("YYYY-MM-DD");
const today = dayjs().format("YYYY-MM-DD");

const [filters, setFilters] = useState({
  search: "",
  uid: "",
  phone: "",
  orderId: "",
  dateFrom: Fromtoday,
  dateTo: today,
  slot: "",
  driverId: "",
  orderStatus: "",
  paymentStatus: "",
});


  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // Fetch slots
  const { data: slots = [], isLoading: slotLoading } = useQuery({
    queryKey: ["slots"],
    queryFn: fetchSlots,
  });

  // Fetch orders
  const { data,  isFetching, isError } = useQuery({
    queryKey: ["orders", page, limit, filters],
    queryFn: fetchOrders,
    placeholderData: { orders: [], totalPages: 1 },
  });

  // Fetch drivers
  const fetchDrivers = async () => {
    const res = await axios.get("https://api.apnifarming.com/user/admin/getalldriverlist.php");
    return res.data?.drivers ?? [];
  };

  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
    staleTime: 60 * 60 * 1000, 
  });

  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;

  // Mutations
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

const handleDownloadPDF = async (filters: any, limit: number) => {
  try {
    setIsPdfLoading(true);

    // Fetch orders
    const params = new URLSearchParams({
      page: "1",
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
    const orders = response.data.orders ?? [];

    if (!orders.length) {
      alert("No orders found for selected filters");
      return;
    }

    

    // Fetch all order items in parallel
    const itemsResponses = await Promise.all(
      orders.map((order: any) =>
        axios.post("https://api.apnifarming.com/user/admin/orderdetail.php", { order_id: order.id })
      )
    );

    const allOrderItems: OrderItem[][] = itemsResponses.map((res) => res.data.items ?? []);

    // Generate PDF
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
    doc.setFontSize(18);
    doc.text("ApniFarming Orders Report", 40, 40);

    let startY = 80;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const items = allOrderItems[i];

      const fromTime = dayjs(`${order.delivery_date} ${order.delivery_from_time}`, "YYYY-MM-DD HH:mm:ss").format("hh:mm A");
      const toTime = dayjs(`${order.delivery_date} ${order.delivery_to_time}`, "YYYY-MM-DD HH:mm:ss").format("hh:mm A");

      // Order summary table
      autoTable(doc, {
        startY,
        theme: "plain",
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 20, right: 20 },
        body: [
          [
            { content: `Order ID: ${order.id}`, styles: { fontStyle: "bold" } },
            { content: `Customer: ${order.first_name || "-"}` },
            { content: `Address: ${order.shipping_address + " " + order.shipping_city || "-"}` },
            { content: `Total Payment: ${order.total_price}` },
          ],
          [
            { content: `Phone: ${order.phone || "-"}` },
            { content: `Delivery Date: ${order.delivery_date || "-"}` },
            { content: `Payment: ${
              order.payment_status === "1" ? "Paid" : order.payment_status === "0" ? "Unpaid" : "Pending"
            }` },
          ],
          [
            { content: `Driver: ${order.driver_name || "not-assigned-yet"} (${order.driver_phone_number || "-"})` },
            { content: `Status: ${order.order_status}` },
            { content: `Delivery Time: ${fromTime} - ${toTime}` },
          ],
        ],
      });

      startY = (doc as any).lastAutoTable?.finalY + 10;

      // Items table
      const tableColumn = ["Product Name", "Qty", "Variant", "Customize", "Price"];
      const tableRows = items.map((item) => [
        item.product_name,
        item.product_qty,
        item.variant_name,
        item.customize || "-",
        `₹${item.sale_price}`,
      ]);

      autoTable(doc, {
        startY,
        head: [tableColumn],
        body: tableRows,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [67, 160, 71], textColor: 255 },
        margin: { left: 40, right: 40 },
      });

      startY = (doc as any).lastAutoTable?.finalY + 20;

      // Add new page if needed
      if (startY > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        startY = 40;
      }
    }

    const today = dayjs().format("YYYY-MM-DD");
    doc.save(`orders-report-${today}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Failed to generate PDF");
  } finally {
    setIsPdfLoading(false);
  }
};



const debouncedSetSearch = useMemo(
  () =>
    debounce((value: string) => {
      setFilters((f) => ({ ...f, search: value }));
      setPage(1);
    }, 500),
  []
);



  if (isPdfLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 shadow-lg">
          <div className="w-12 h-12 border-4 border-t-green-600 border-gray-200 rounded-full animate-spin"></div>
          <p className="text-gray-700 font-medium text-lg">Generating PDF...</p>
          <p className="text-gray-500 text-sm">Please wait while your report is being prepared.</p>
        </div>
      </div>
    );

  if (isFetching) return <Loader />;
  if (isError) return <p className="text-red-500">Failed to fetch orders.</p>;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-wrap gap-1 items-center">
           <Input
  placeholder="Search by name / phone / order ID"
  defaultValue={filters.search} // Use defaultValue for uncontrolled input
  onChange={(e) => debouncedSetSearch(e.target.value)}
  className="w-[300px]"
/>
            
            <Input
              type="number"
              placeholder="Order ID"
              value={filters.orderId}
              onChange={(e) => setFilters((f) => ({ ...f, orderId: e.target.value }))}
              className="w-[160px]"
            />
            <div>
              <h2>From Date :</h2>
              <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="w-[170px]"
              placeholder="Created To"
            />
            </div>
            <div>
              <h2>To Date :</h2>
              <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="w-[170px]"
              placeholder="Created To"
            />
            </div>
           

            {/* Order Status Filter */}
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

            {/* Payment Status Filter */}
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => setFilters((f) => ({ ...f, paymentStatus: value }))}
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

            {/* Driver Filter */}
            <Select
              value={filters.driverId || "all"}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, driverId: value === "all" ? "" : value }))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {driversLoading
                  ? <SelectItem value="loading">Loading...</SelectItem>
                  : drivers.map((driver: any) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.driver_name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            {/* Slot Filter */}
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

            <Button
              onClick={() => handleDownloadPDF(filters, limit)}
              className="bg-green-600 text-white"
            >
              Download PDF
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

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex gap-3 items-center mb-4 flex-wrap">
            <p className="text-sm">Bulk Actions ({selectedOrders.length} selected):</p>

            {/* Bulk Status Update */}
            <Select
              onValueChange={(value) => {
                const statusEntry = Object.values(statusMap).find(
                  (s) => s.code.toString() === value
                );
                if (!statusEntry) return;
                Ordermutation.mutate({ orderIds: selectedOrders, status: statusEntry.code });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusMap).map(([key, s]) => (
                  <SelectItem key={key} value={s.code.toString()}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bulk Payment Update */}
            <Select
              onValueChange={(value) => {
                const paymentStatus = parseInt(value);
                selectedOrders.forEach((orderId) => {
                  const order = orders.find((o) => o.id === orderId);
                  if (!order) return;
                  const totalReceived = paymentStatus === 1 ? parseFloat(order.totalPrice) : 0;
                  PaymentMutation.mutate({
                    orderId,
                    paymentStatus,
                    totalReceivedAmount: totalReceived,
                  });
                });
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Change Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Unpaid</SelectItem>
                <SelectItem value="1">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSelectedOrders([])}
            >
              Clear Selection
            </Button>
          </div>
        )}

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

// --- OrderRow Component ---
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
              <p className="text-sm text-muted-foreground">Order id :{order.id}</p>
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
           
<p className="text-sm">
  <strong>Delivery Time:</strong>{' '}
  {`${dayjs(order.deliveryFromTime, ['HH:mm:ss', 'hh:mm A']).format('hh:mm A')} - ${dayjs(order.deliveryToTime, ['HH:mm:ss', 'hh:mm A']).format('hh:mm A')}`}
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

// --- PaymentForm ---
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

  const [status, setStatus] = useState(alreadyReceived >= totalPrice ? "1" : "0");
  const [receivedAmount, setReceivedAmount] = useState(pendingAmount.toString());

  const handleStatusChange = (val: string) => {
    setStatus(val);
    if (val === "1") {
      // Show pending amount if marking as Paid
      setReceivedAmount(pendingAmount.toString());
    } else {
      // Clear input or set to 0 if Unpaid
      setReceivedAmount("0");
    }
  };

  const handleSave = () => {
    const amount = parseFloat(receivedAmount) || 0;
    paymentMutation.mutate(
      {
        orderId: order.id,
        paymentStatus: parseInt(status),
        totalReceivedAmount: alreadyReceived + amount, // add to already received
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Unpaid</SelectItem>
          <SelectItem value="1">Paid</SelectItem>
        </SelectContent>
      </Select>

      {/* Only show input if Paid */}
      {status === "1" && (
        <Input
  type="number"
  value={receivedAmount}
  placeholder="Enter received amount"
  onChange={(e) => {
    let val = parseFloat(e.target.value) || 0;
    const maxAmount = parseFloat(pendingAmount.toString()); // or whatever max you want
    if (val > maxAmount) val = maxAmount;
    setReceivedAmount(val.toString());
  }}
/>

      )}

      <div className="flex justify-end gap-2 mt-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={paymentMutation.isPending}>
          {paymentMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

// --- OrderDetails ---
function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-2">
      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>Name:</strong> {order.firstName}</p>
      <p><strong>Email:</strong> {order.email}</p>
      <p><strong>Phone:</strong> {order.phone}</p>
      <p><strong>Address:</strong> {order.shippingAddress}, {order.shippingCity}, {order.shippingState}</p>
      <p><strong>Delivery Date:</strong> {order.deliveryDate}</p>
      <p><strong>Delivery Instructions:</strong> {order.deliveryInstruction}</p>
      <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
      <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
      <p><strong>Tax:</strong> ₹{order.tax}</p>
      <p><strong>Discount:</strong> ₹{order.discount}</p>
      <p><strong>Shipping Price:</strong> ₹{order.shippingPrice}</p>
      <p><strong>Driver:</strong> {order.driverName || "Not Assigned"}</p>
    </div>
  );
}

// --- OrderItems ---
function OrderItems({ orderId }: { orderId: number }) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["orderItems", orderId],
    queryFn: () => fetchOrderItems(orderId),
  });

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="p-2 border rounded flex justify-between">
          <p>{item.product_name}</p>
          <p>Qty: {item.product_qty}</p>
          <p>Variant: {item.variant_name}</p>
          <p>Customize: {item.customize || "-"}</p>
          <p>Price: ₹{item.sale_price}</p>
        </div>
      ))}
    </div>
  );
}





