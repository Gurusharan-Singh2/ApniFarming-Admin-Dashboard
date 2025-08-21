// pages/cart.js

import { useMemo } from "react";
import useCartStore from "../Store/Cart"; // You'll need a web-compatible Zustand store
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";




export default function CartPage() {
  const { cart, discount, finalAmount, decrement, increment, removeFromCart } = useCartStore();
 
  const router = useRouter();

  const renderItem = (item, index) => (
    <div key={`${item.id}-${item.selectedSize?.size}-${index}`} className="flex gap-3 mt-3 bg-white p-2 border-b border-gray-100 shadow relative">
      <div className="absolute right-2 top-2">
        <p className="text-xs font-bold">
          {item?.quantity} X ₹ {item?.selectedSize?.sellPrice} = ₹
          {item?.quantity * item?.selectedSize?.sellPrice || 0}
        </p>
      </div>

      <div className="flex items-center border border-gray-200 p-1 rounded-lg">
        <img className="w-28 h-28 rounded-lg object-cover" src={item.image} alt={item.name} />
      </div>

      <div className="flex flex-col justify-between flex-1">
        <div>
          <p className="text-gray-600 font-semibold">{item.name}</p>
          <p className="text-gray-400 font-semibold text-sm">
            {item.selectedSize?.size} {item.selectedSize?.option}
          </p>
        </div>

        <div className="flex justify-between items-center mt-2">
          <div>
            <div className="flex items-center mb-2">
              {item?.selectedSize?.discount && (
                <span className="text-sm font-semibold py-1 px-1 rounded-l-lg bg-red-700 text-white line-through">
                  ₹{item?.selectedSize?.costPrice}
                </span>
              )}
              <span className="text-sm bg-white mx-1 px-2 py-1 rounded text-green-600 font-bold">
                ₹{item?.selectedSize?.sellPrice}
              </span>
            </div>
            <button
              onClick={() => removeFromCart(item?.id, item?.selectedSize?.id)}
              className="text-red-600"
            >
              🗑
            </button>
          </div>

          <div className="flex items-center justify-between bg-green-600 rounded-lg px-1 py-2 w-28">
            <button onClick={() => decrement(item.id, item.selectedSize?.id)} className="text-white text-2xl">
              -
            </button>

            <span className="text-lg font-semibold text-white">{item.quantity}</span>

            <button
              onClick={() => {
                if (item?.selectedSize?.maxOrder === null) {
                  increment(item.id, item.selectedSize?.id);
                } else {
                  if (item?.quantity < item?.selectedSize?.maxOrder) {
                    increment(item.id, item.selectedSize?.id);
                  } else {
                    toast.error("Max Quantity Reached");
                  }
                }
              }}
              className="text-white text-xl"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className=" bg-gray-50">
      <div className="px-4 py-2 flex justify-between items-center  text-black">
        <h1 className="text-lg font-bold">Cart</h1>
      </div>

    
        <div className="p-4 space-y-3">
          {cart.map(renderItem)}
        </div>
  

     
       
    </div>
  );
}
