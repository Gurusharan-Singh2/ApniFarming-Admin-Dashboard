import { addProductWithImageAction } from "@/actions/products/add-product-with-image"
import { useMutation } from "@tanstack/react-query"

export const useAddproductWithImage = () =>{
  return useMutation({
    mutationFn: async (data:any) => {
      await addProductWithImageAction(data)
     
 } })

}