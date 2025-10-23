import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeOrderStatuses, changePaymentStatus } from "../api/orderApi";

export const useOrderMutations = () => {
  const queryClient = useQueryClient();

  const orderMutation = useMutation({
    mutationFn: changeOrderStatuses,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  const paymentMutation = useMutation({
    mutationFn: changePaymentStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });

  return { orderMutation, paymentMutation };
};
