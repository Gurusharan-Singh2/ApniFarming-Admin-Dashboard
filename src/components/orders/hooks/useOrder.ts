import { useQuery } from "@tanstack/react-query";
import { fetchSlots, fetchOrders, fetchDrivers } from "../api/orderApi";

export const useOrdersData = (page: number, limit: number, filters: any) => {
  const ordersQuery = useQuery({
    queryKey: ["orders", page, limit, filters],
    queryFn: fetchOrders,
    placeholderData: { orders: [], totalPages: 1 },
  });

  const slotsQuery = useQuery({ queryKey: ["slots"], queryFn: fetchSlots });
  const driversQuery = useQuery({ queryKey: ["drivers"], queryFn: fetchDrivers });

  return { ordersQuery, slotsQuery, driversQuery };
};
