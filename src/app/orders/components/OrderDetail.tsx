import { Order } from "../types/index";

export function OrderDetails({ order }: { order: Order }) {
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
