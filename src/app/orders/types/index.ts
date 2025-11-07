

export type Order = {
  id: number;
  uid: number;
  firstName: string;
  email: string | null;
  phone: string;
  paymentMethod: string;
  totalPrice: string;
  tax: string;
  shippingPrice: string;
  couponCode: string;
  discount: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  deliveryDate: string;
  deliveryFromTime: string;
  deliveryToTime: string;
  shippingState: string;
  shippingCountry: string;
  driverId: number | null;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  deliveryInstruction: string;
  driverName: string | null;
  driverPhoneNumber: string | null;
  paymentStatus: string;
  totalReceivedAmount: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_qty: string;
  sale_price: string;
  mrp: string;
  variant_id: number;
  variant_name: string;
  customize?: string;
};