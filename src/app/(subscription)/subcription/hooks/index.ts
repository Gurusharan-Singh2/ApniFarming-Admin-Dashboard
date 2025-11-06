import { useQuery } from "@tanstack/react-query"
import { getAllSubscriptionAction } from "../action"


export const useAllSubscription=()=>{
  return useQuery({
    queryKey:['subscriptions'],
    queryFn:async()=>await getAllSubscriptionAction()
  })
}