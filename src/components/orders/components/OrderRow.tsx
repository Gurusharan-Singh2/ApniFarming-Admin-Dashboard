import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { statusColors, paymentStatusLabels } from "../../../utils/statusMap";
import { PaymentForm } from "./PaymentForm";
import { fetchOrderItems } from "../api/orderApi";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

interface OrderRowProps {
  order: any;
  selected: boolean;
  toggleOrderSelection: (id: number) => void;
  mutation: any;
  paymentMutation: any;
}

export const OrderRow: React.FC<OrderRowProps> = ({
  order,
  selected,
  toggleOrderSelection,
  mutation,
  paymentMutation,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);

  const itemsQuery = useQuery({
    queryKey: ["order-items", order.id],
    queryFn: () => fetchOrderItems(order.id),
    enabled: itemsOpen,
  });

  const handleStatusChange = (statusCode: number) => {
    mutation.mutate({ orderIds: [order.id], status: statusCode });
  };

  const handlePaymentSubmit = (data: {
    orderId: number;
    paymentStatus: number;
    totalReceivedAmount: number;
  }) => {
    paymentMutation.mutate(data, { onSuccess: () => setPaymentFormOpen(false) });
  };

  const paymentColor =
    order.payment_status === 1
      ? "bg-green-100 text-green-700"
      : order.payment_status === 2
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  const orderStatusKey = (order.order_status as string)?.toLowerCase() as keyof typeof statusColors;
  const orderColor =
    statusColors[orderStatusKey] || "bg-gray-100 text-gray-800";

  return (
    <Card className="p-4 mb-2 hover:bg-gray-50 transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => toggleOrderSelection(order.id)}
          />
          <div>
            <p className="font-semibold text-sm">
              Order #{order.id} • {order.first_name}
            </p>
            <p className="text-xs text-gray-500">
              {dayjs(order.created_at).format("DD MMM YYYY, hh:mm A")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 md:mt-0 md:gap-4">
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${orderColor}`}>
            {order.order_status}
          </span>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${paymentColor}`}>
            {paymentStatusLabels[order.payment_status as keyof typeof paymentStatusLabels]}
          </span>
          <span className="text-sm text-gray-600">₹{order.total_price}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setItemsOpen(true)}>
          Items
        </Button>
        <Button size="sm" variant="outline" onClick={() => setDetailsOpen(true)}>
          Details
        </Button>
        <Button size="sm" variant="outline" onClick={() => setPaymentFormOpen(true)}>
          Payment
        </Button>

        {/* Quick status buttons */}
        <Button
          size="sm"
          className="bg-blue-600 text-white"
          onClick={() => handleStatusChange(1)}
        >
          Processed
        </Button>
        <Button
          size="sm"
          className="bg-yellow-600 text-white"
          onClick={() => handleStatusChange(3)}
        >
          Out for Delivery
        </Button>
        <Button
          size="sm"
          className="bg-green-600 text-white"
          onClick={() => handleStatusChange(4)}
        >
          Delivered
        </Button>
      </div>

      {/* Items Modal */}
      {itemsOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] md:w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Items for Order #{order.id}</h2>
            {itemsQuery.isLoading && <p>Loading...</p>}
            {itemsQuery.data?.length ? (
              <ul className="space-y-2">
                {itemsQuery.data.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex justify-between border-b pb-1 text-sm"
                  >
                    <span>{item.product_name}</span>
                    <span>
                      {item.qty} × ₹{item.price}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items found.</p>
            )}
            <div className="mt-4 text-right">
              <Button variant="outline" onClick={() => setItemsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      <PaymentForm
        open={paymentFormOpen}
        onClose={() => setPaymentFormOpen(false)}
        orderId={order.id}
        currentStatus={order.payment_status}
        totalPrice={order.total_price}
        onSubmit={handlePaymentSubmit}
        isLoading={paymentMutation.isPending}
      />

      {/* Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] md:w-[600px] max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              Order Details #{order.id}
            </h2>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <p><strong>Customer:</strong> {order.first_name}</p>
              <p><strong>Phone:</strong> {order.phone}</p>
              <p><strong>Slot:</strong> {order.slot}</p>
              <p><strong>Driver:</strong> {order.driver_name ?? "N/A"}</p>
              <p><strong>Total:</strong> ₹{order.total_price}</p>
              <p><strong>Address:</strong> {order.address}</p>
              <p><strong>Payment Status:</strong> {paymentStatusLabels[order.payment_status as keyof typeof paymentStatusLabels]}</p>
              <p><strong>Order Status:</strong> {order.order_status}</p>
            </div>

            <div className="mt-4 text-right">
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
