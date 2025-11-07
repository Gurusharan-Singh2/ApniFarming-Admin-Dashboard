import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "./PaymentForm";
import { OrderDetails } from "./OrderDetail";
import { OrderItems } from "./OrderItems";
import { Order } from "../types";
import { statusColors, statusMap } from "../utils";

const paymentStatusLabels: Record<string, string> = {
  "0": "Unpaid",
  "1": "Paid",
  "2": "Pending",
};

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
  const [openPayment, setOpenPayment] = useState(false);
  const statusKey = order?.orderStatus?.toLowerCase();
  const statusInfo = statusMap[statusKey];

  const totalPrice = parseFloat(order.totalPrice) || 0;
  const received = parseFloat(order.totalReceivedAmount) || 0;
  const pending = Math.max(totalPrice - received, 0);

  console.log(order);
  

  return (
    <Card className="p-3 w-full transition-all duration-200 hover:shadow-sm border-muted/40 rounded-lg">
      <CardHeader className="flex flex-row items-start justify-between pb-1 space-y-0">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={selected}
            onCheckedChange={() => toggleOrderSelection(order.id)}
            className="mt-0.5"
          />
          <div>
            <CardTitle className="text-base font-semibold leading-tight">
              {order?.firstName}
            </CardTitle>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>Order ID: <span className="font-medium text-foreground">{order.id}</span></p>
              <p>{dayjs(order.createdAt).format("DD MMM YYYY")}</p>
            </div>
          </div>
        </div>

        <Badge
          className={`text-xs px-2 py-0.5 rounded-md ${
            statusColors[statusKey] || "bg-gray-500 text-white"
          }`}
        >
          {statusInfo?.label || order?.orderStatus}
        </Badge>
      </CardHeader>

      <CardContent className="pt-1 space-y-2 border-t border-muted/40">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5">
          <Info label="Phone" value={order.phone} />
          <Info label="Address" value={order.shippingAddress} />
          <Info
            label="Payment"
            value={paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
          />
          <Info label="Pending" value={`₹${pending}`} highlight />
          <Info
            label="Delivery"
            value={`${dayjs(order.deliveryFromTime, ["HH:mm:ss", "hh:mm A"]).format("hh:mm A")} - ${dayjs(order.deliveryToTime, ["HH:mm:ss", "hh:mm A"]).format("hh:mm A")}`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <Select
            value={statusKey}
            disabled={mutation.isPending}
            onValueChange={(value) => {
              const statusEntry = statusMap[value];
              if (!statusEntry) return;
              mutation.mutate({ orderIds: [order.id], status: statusEntry.code });
            }}
          >
            <SelectTrigger className="w-36 h-8 text-xs">
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

          {/* Update Payment */}
          <Dialog open={openPayment} onOpenChange={setOpenPayment}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="h-8 text-xs">
                Update Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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

          {/* View Details */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[75vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
              </DialogHeader>
              <OrderDetails order={order} />
            </DialogContent>
          </Dialog>

          {/* View Items */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                Items
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[75vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Order Items</DialogTitle>
              </DialogHeader>
              <OrderItems orderId={order.id} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
});

const Info = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium leading-none">
      {label}
    </span>
    <span
      className={`text-xs leading-tight ${
        highlight ? "font-semibold text-primary" : "text-foreground"
      }`}
    >
      {value}
    </span>
  </div>
);

export default OrderRow;
