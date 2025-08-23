"use client";
// import { useRouter } from "next/navigation";
import  useCartStore  from "../Store/Cart"
import { ShoppingCart } from 'lucide-react';


export default function CartIconWithBadge({handleCheckoutClick}) {
  const { totalItems } = useCartStore();


  return (
    <div className=" absolute p-1 right-4 ">
      <button
        onClick={handleCheckoutClick}
        className="relative flex items-center justify-center"
      >
        <ShoppingCart size={32} />
        {totalItems > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
