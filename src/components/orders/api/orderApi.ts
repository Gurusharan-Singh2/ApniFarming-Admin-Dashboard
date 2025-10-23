import axios from "axios";

export const fetchSlots = async () => {
  const res = await axios.get("https://api.apnifarming.com/user/admin/getAllslot.php");
  return res.data?.data ?? [];
};

export const fetchDrivers = async () => {
  const res = await axios.get("https://api.apnifarming.com/user/admin/getalldriverlist.php");
  return res.data?.drivers ?? [];
};

export const fetchOrders = async ({ queryKey }: { queryKey: any }) => {
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
    orders: response?.data?.orders ?? [],
    totalPages: response?.data?.total_pages ?? 1,
  };
};

export const fetchOrderItems = async (id: number) => {
  const response = await axios.post(
    "https://api.apnifarming.com/user/admin/orderdetail.php",
    { order_id: id }
  );
  return response?.data?.items ?? [];
};

export const changeOrderStatuses = async ({ orderIds, status }: { orderIds: number[]; status: number }) => {
  await axios.post("https://api.apnifarming.com/user/admin/changeorderstaus.php", {
    order_ids: orderIds,
    order_status: status,
  });
};

export const changePaymentStatus = async ({
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
