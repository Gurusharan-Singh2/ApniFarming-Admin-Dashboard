"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionsProps {
  selectedOrders: number[];
  orders: any[];
  statusMap: Record<string, { label: string; code: number }>;
  OrderMutation: any;
  PaymentMutation: any;
  clearSelection: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedOrders,
  orders,
  statusMap,
  OrderMutation,
  PaymentMutation,
  clearSelection,
}) => {
  if (selectedOrders.length === 0) return null;

  return (
    <div className="flex gap-3 items-center mb-4 flex-wrap">
      <p className="text-sm">Bulk Actions ({selectedOrders.length} selected):</p>

      {/* Status */}
      <Select
        onValueChange={(v) => {
          const entry = Object.values(statusMap).find((s) => s.code.toString() === v);
          if (entry) OrderMutation.mutate({ orderIds: selectedOrders, status: entry.code });
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

      {/* Payment */}
      <Select
        onValueChange={(v) => {
          const paymentStatus = parseInt(v);
          selectedOrders.forEach((id) => {
            const order = orders.find((o) => o.id === id);
            if (!order) return;
            const totalReceived = paymentStatus === 1 ? parseFloat(order.totalPrice) : 0;
            PaymentMutation.mutate({
              orderId: id,
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

      <Button variant="outline" onClick={clearSelection}>
        Clear Selection
      </Button>
    </div>
  );
};

export default BulkActions;
