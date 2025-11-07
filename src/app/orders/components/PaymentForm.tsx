import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Order } from "../types";


export function PaymentForm({
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
    const maxAmount = parseFloat(pendingAmount.toString()); 
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