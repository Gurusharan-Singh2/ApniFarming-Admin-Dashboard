"use client";
import useCartStore from "../Store/Cart";
export default function OrderSummary() {
    const {
    cart,
    finalAmount,
    totalAmount,
    gstAmount,
    deliveryCharge,
    couponCode,
    subtotal,
    couponDiscount,
  } = useCartStore();
  return (
    <div className="bg-gray rounded-lg shadow-sm p-4 mb-4">
      {/* Heading */}
      <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>

     

     


        {/* Divider + Total */}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-start">
            <span className="">Tax</span>
            <div className="text-right">
              <p className=" text-lg">₹{gstAmount}</p>
              
            </div>
          </div>
          <div className="flex justify-between items-start">
            <span className="">Delivery Charge</span>
            <div className="text-right">
              <p className=" text-lg">₹{deliveryCharge===0 ?'Free':deliveryCharge}</p>
              
            </div>
          </div>
          <div className="flex justify-between items-start">
            <span className="font-bold">Total</span>
            <div className="text-right">
              <p className="font-bold text-lg">₹{finalAmount}</p>
              
            </div>
          </div>
          
        </div>
      </div>
    
  );
}
