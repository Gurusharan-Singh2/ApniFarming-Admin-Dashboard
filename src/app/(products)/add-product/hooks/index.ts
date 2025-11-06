import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useRouter } from "next/navigation"
import { addProductWithImageAction } from "../action"
import { toast } from "react-toastify"



export const useAllcategories=()=>{
  return  useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get(`https://api.apnifarming.com/user/categories/getAllCategories.php`)
      return res.data
    },
  })
}

export const useAddProduct=()=>{
  const router=useRouter();
  const queryClient=useQueryClient();
  return useMutation({
  
   mutationFn: async (data:any) => {
         await addProductWithImageAction(data)
        
    },
    onSuccess: () => {
      toast.success("Product uploaded successfully!");
      queryClient.invalidateQueries({queryKey:['products']});  
     
      router.replace("/all-products")
    },
    onError: (err: any) => {
      alert("Upload failed: " + (err.response?.data?.message || err.message))
    },
  })
}