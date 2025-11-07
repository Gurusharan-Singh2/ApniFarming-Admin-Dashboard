import { Loader } from "@/components/Loader";
import { useQuery } from "@tanstack/react-query";
import { fetchOrderItems } from "../apicall";



export function OrderItems({ orderId }: { orderId: number }) {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["orderItems", orderId],
    queryFn: () => fetchOrderItems(orderId),
  });

  if (isLoading) return <Loader />;

  return (
    <div className="flex flex-col gap-2">
      {items.map((item:any) => (
        <div key={item.id} className="p-2 border rounded flex justify-between">
          <p>{item.product_name}</p>
          <p>Qty: {item.product_qty}</p>
          <p>Variant: {item.variant_name}</p>
          <p>Customize: {item.customize || "-"}</p>
          <p>Price: ₹{item.sale_price}</p>
        </div>
      ))}
    </div>
  );
}