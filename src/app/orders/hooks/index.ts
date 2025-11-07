import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { changeOrderStatuses, changePaymentStatus, fetchDrivers, fetchOrders, fetchSlots } from "../apicall"


export const useFetchSlots=()=>{
  return useQuery({
    queryKey: ["slots"],
    queryFn: fetchSlots,
  })
}

export const useFetchOrders=(page:number,limit:number,filters:any)=>{
  return  useQuery({
    queryKey: ["orders", page, limit, filters],
    queryFn: fetchOrders,
    placeholderData: { orders: [], totalPages: 1 },
  });
}

export const useFetchDriver=()=>{
  return useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
    staleTime: 60 * 60 * 1000, 
  });
}

export  const  useOrderMutation=(setSelectedOrders:any)=>{
  const queryClient=useQueryClient();
  return useMutation({
      mutationFn: changeOrderStatuses,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        setSelectedOrders([]);
      },
      onError: (error) => {
        console.error("Failed to update status", error);
      },
    });
}

export const usePaymentMutaion=()=>{
   const queryClient=useQueryClient();
  return useMutation({
      mutationFn: changePaymentStatus,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      },
      onError: (error) => {
        console.error("Failed to update payment status", error);
      },
    });
}