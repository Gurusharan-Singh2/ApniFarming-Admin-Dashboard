// components/orders/components/OrderDetails.tsx
import React from "react";
import dayjs from "dayjs";

export const OrderDetails: React.FC<{ order: any }> = ({ order }) => {
  return (
    <div className="space-y-2 text-sm">
      <p><strong>Order ID:</strong> {order.id}</p>
      <p><strong>Name:</strong> {order.firstName}</p>
      <p><strong>Email:</strong> {order.email ?? "-"}</p>
      <p><strong>Phone:</strong> {order.phone}</p>
      <p><strong>Address:</strong> {order.shippingAddress}, {order.shippingCity} {order.shippingPostalCode}</p>
      <p><strong>Delivery Date:</strong> {order.deliveryDate ? dayjs(order.deliveryDate).format("DD MMM YYYY") : "-"}</p>
      <p><strong>Delivery Time:</strong> {order.deliveryFromTime ?? "-"} - {order.deliveryToTime ?? "-"}</p>
      <p><strong>Instructions:</strong> {order.deliveryInstruction ?? "-"}</p>
      <p><strong>Payment Method:</strong> {order.paymentMethod ?? "-"}</p>
      <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
      <p><strong>Tax:</strong> ₹{order.tax ?? 0}</p>
      <p><strong>Discount:</strong> ₹{order.discount ?? 0}</p>
      <p><strong>Shipping:</strong> ₹{order.shippingPrice ?? 0}</p>
      <p><strong>Driver:</strong> {order.driverName ?? "Not Assigned"}</p>
    </div>
  );
};
