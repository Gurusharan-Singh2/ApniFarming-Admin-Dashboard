import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteProductAction, editProductWithImageAction, getAllProductsAction, getProductsByCategoryAction } from "../action"
import { toast } from "react-toastify"
import axios from "axios";

const fetchProducts = async (categoryId: number) => {
  try {
    if (categoryId === 0) {
      const response = await getAllProductsAction();
      return response;
    } else {
      const response = await getProductsByCategoryAction(categoryId);
      return response;
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

 


export const useAllProduct=(categoryId:number)=>{
  return useQuery({
    queryKey: ["products",categoryId],
    queryFn: ()=>  fetchProducts(Number(categoryId)),
     staleTime: 1000 * 60 * 2, // cache valid for 2 minutes
    retry: 3
  })
}

export const useDeleteProduct=()=>{
const queryclient =useQueryClient();
  return useMutation({
    mutationFn:async(id:number)=>await deleteProductAction(id),
    onSuccess:()=>{
      queryclient.invalidateQueries({queryKey:["products"]})
      toast.success("Product deleted successfully !!!")
    }
  })
}

export const useUpdateProduct=()=>{
  const queryclient =useQueryClient();
  return useMutation({
    mutationFn:async(data:any)=>await editProductWithImageAction(data),
    onSuccess:()=>{
      queryclient.invalidateQueries({queryKey:["products"]})
      toast.success("Product Update successfully !!!")
    }
  })
}

