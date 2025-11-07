import axios from "axios";
import { Order, OrderItem } from "../types";

export const fetchOrderItems = async (id: number): Promise<OrderItem[]> => {
  const response = await axios.post(
    "https://api.apnifarming.com/user/admin/orderdetail.php",
    { order_id: id }
  );
  return response?.data?.items ?? [];
};

export const fetchSlots = async () => {
  const res = await axios.get(
    "https://api.apnifarming.com/user/admin/getAllslot.php"
  );
  return res.data?.data ?? [];
};

export const fetchOrders = async ({
  queryKey,
}: {
  queryKey: any;
}): Promise<{ orders: Order[]; totalPages: number }> => {
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
    ...(filters.orderStatus
      ? { order_status: String(filters.orderStatus) }
      : {}),
    ...(filters.paymentStatus
      ? { payment_status: String(filters.paymentStatus) }
      : {}),
  });

  const response = await axios.get(
    `https://api.apnifarming.com/user/admin/orderlist.php?${params.toString()}`
  );

  return {
    orders:
      response?.data?.orders?.map((o: any) => ({
        id: o.id,
        uid: o.uid,
        firstName: o.first_name,
        email: o.email,
        phone: o.phone,
        paymentMethod: o.payment_method,
        totalPrice: o.total_price,
        tax: o.tax,
        shippingPrice: o.shipping_price,
        couponCode: o.coupon_code,
        discount: o.discount,
        shippingAddress: o.shipping_address,
        shippingCity: o.shipping_city,
        shippingPostalCode: o.shipping_postalcode,
        deliveryDate: o.delivery_date,
        deliveryFromTime: o.delivery_from_time,
        deliveryToTime: o.delivery_to_time,
        shippingState: o.shipping_state,
        shippingCountry: o.shipping_country,
        driverId: o.driver_id,
        orderStatus: o.order_status,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        deliveryInstruction: o.delivey_instruction,
        driverName: o.driver_name,
        driverPhoneNumber: o.driver_phone_number,
        paymentStatus: o.payment_status,
        totalReceivedAmount: o.total_recived_amount,
      })) ?? [],
    totalPages: response?.data?.total_pages ?? 1,
  };
};

export const fetchDrivers = async () => {
  const res = await axios.get(
    "https://api.apnifarming.com/user/admin/getalldriverlist.php"
  );
  return res.data?.drivers ?? [];
};

export const changeOrderStatuses = async ({
  orderIds,
  status,
}: {
  orderIds: number[];
  status: number;
}) => {
  await axios.post(
    "https://api.apnifarming.com/user/admin/changeorderstaus.php",
    {
      order_ids: orderIds,
      order_status: status,
    }
  );
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