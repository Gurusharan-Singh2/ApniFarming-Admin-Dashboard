// components/orders/components/BulkActions.tsx
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { statusMap } from "../../../utils/statusMap";

type Props = {
  selectedOrders: number[];
  setSelectedOrders: (v: number[]) => void;
  orderMutation: any;
  paymentMutation: any;
  orders: any[];
};

export const BulkActions: React.FC<Props> = ({ selectedOrders, setSelectedOrders, orderMutation, paymentMutation, orders }) => {
  if (!selectedOrders.length) return null;

  return (
    <div className="flex gap-3 items-center mb-4 flex-wrap">
      <p className="text-sm">Bulk Actions ({selectedOrders.length} selected):</p>

      <Select onValueChange={(value) => {
        const statusEntry = Object.values(statusMap).find((s) => s.code.toString() === value);
        if (!statusEntry) return;
        orderMutation.mutate({ orderIds: selectedOrders, status: statusEntry.code });
        setSelectedOrders([]);
      }}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Change Status" /></SelectTrigger>
        <SelectContent>
          {Object.entries(statusMap).map(([k, s]) => <SelectItem key={k} value={s.code.toString()}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => {
        const paymentStatus = parseInt(value);
        selectedOrders.forEach((orderId) => {
          const order = orders.find((o) => o.id === orderId);
          if (!order) return;
          const totalReceived = paymentStatus === 1 ? parseFloat(order.totalPrice ?? order.total_price ?? 0) : 0;
          paymentMutation.mutate({
            orderId,
            paymentStatus,
            totalReceivedAmount: totalReceived,
          });
        });
        setSelectedOrders([]);
      }}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Change Payment" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Unpaid</SelectItem>
          <SelectItem value="1">Paid</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={() => setSelectedOrders([])}>Clear Selection</Button>
    </div>
  );
};
