import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paymentStatusLabels } from "../../../utils/statusMap";

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  orderId: number;
  currentStatus: number;
  totalPrice: number;
  onSubmit: (data: { orderId: number; paymentStatus: number; totalReceivedAmount: number }) => void;
  isLoading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  open,
  onClose,
  orderId,
  currentStatus,
  totalPrice,
  onSubmit,
  isLoading = false,
}) => {
  const [paymentStatus, setPaymentStatus] = useState(currentStatus);
  const [receivedAmount, setReceivedAmount] = useState(totalPrice.toString());

  const handleSubmit = () => {
    if (!receivedAmount || isNaN(Number(receivedAmount))) {
      alert("Please enter a valid amount.");
      return;
    }
    onSubmit({
      orderId,
      paymentStatus,
      totalReceivedAmount: Number(receivedAmount),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Payment Status</label>
            <select
              className="w-full mt-1 border rounded-md p-2"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(Number(e.target.value))}
            >
              {Object.entries(paymentStatusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Received Amount (₹)</label>
            <Input
              type="number"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
