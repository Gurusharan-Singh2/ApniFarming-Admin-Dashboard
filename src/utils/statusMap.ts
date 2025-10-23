export const statusMap = {
  "order processed": { label: "Order Processed", code: 1 },
  "order confirmed": { label: "Order Confirmed", code: 2 },
  "out for delivery": { label: "Out for Delivery", code: 3 },
  delivered: { label: "Delivered", code: 4 },
  refunded: { label: "Refunded", code: 8 },
  cancelled: { label: "Cancelled", code: 9 },
};

export const paymentStatusLabels = {
  "0": "Unpaid",
  "1": "Paid",
  "2": "Pending",
};

export const statusColors = {
  "order processed": "bg-blue-500 text-white",
  "order confirmed": "bg-indigo-500 text-white",
  "out for delivery": "bg-yellow-500 text-black",
  delivered: "bg-green-600 text-white",
  cancelled: "bg-red-600 text-white",
  refunded: "bg-purple-600 text-white",
};
