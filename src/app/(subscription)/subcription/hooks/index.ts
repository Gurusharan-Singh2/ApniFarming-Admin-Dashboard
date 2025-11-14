import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CancelSubscription, fetchItems, getAllSubscriptionAction } from "../action"
import { toast } from "react-toastify"


export const useAllSubscription=()=>{
  return useQuery({
    queryKey:['subscriptions'],
    queryFn:async()=>await getAllSubscriptionAction()
  })
}

export const useSubscriptionItems=(id:number,options?:any)=>{
  return useQuery({
    queryKey:['subscription-items',id],
    queryFn:async()=>await fetchItems(id),
    enabled:!!id,
    ...options
  })
}

export const useCancelSubscription=(setOpenCancel:any)=>{

  const queryCLient=useQueryClient();
  return useMutation({
    mutationFn:async(id:number)=> await CancelSubscription(id),
    
    onSuccess:()=>{
      toast.success("Subscription Cancelled Successfully !!!");
      setOpenCancel(false);
      queryCLient.invalidateQueries({queryKey:['subscriptions']})
    }
    
    
  })
}