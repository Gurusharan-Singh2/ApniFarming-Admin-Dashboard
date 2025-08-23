'use client';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import CartPage from '../components/cart';
import useCartStore from '@/Store/Cart';
import { toast } from 'react-toastify';
import DeliverySlotSelector from './SlotSelector';
import { useMutation } from '@tanstack/react-query';
import OrderSummary from './OrderSummary';

const Checkout = ({ setCheckout, user, address }) => {
  const {
    cart,
    finalAmount,
    totalAmount,
    gstAmount,
    deliveryCharge,
    couponCode,
     applyChargesFromBackend,
    couponDiscount,
  } = useCartStore();


  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // keep as string
  });

  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTimeSlots = useCallback(
    async (dateParam, showLoader = false) => {
      if (showLoader) setIsLoading(true);
      try {
        const res = await axios.get(
          `https://api.apnifarming.com/user/checkout/slots.php?subtotal=${finalAmount}`
        );

        const rawSlotsData = res?.data?.data;
     
        
        if (res?.data?.success===true){
         applyChargesFromBackend({
        delivery_charge: parseFloat(res.data.deliverycharge || 0),
        gst: parseFloat(res.data.tax || 0),
      });
        }
        const parsedSlots =
          typeof rawSlotsData === 'string'
            ? JSON.parse(rawSlotsData)
            : rawSlotsData;

        const allSlots = Array.isArray(parsedSlots) ? parsedSlots : [];
        setTimeSlots(allSlots);

        if (allSlots.length > 0) {
          const dateObj = new Date(dateParam);
          const now = new Date();

          const validSlot = allSlots.find((slot) => {
            const [h, m] = slot.start_time.split(':').map(Number);
            const slotDateTime = new Date(
              dateObj.getFullYear(),
              dateObj.getMonth(),
              dateObj.getDate(),
              h,
              m
            );

            if (dateObj.toDateString() === now.toDateString()) {
              return slotDateTime > now;
            }
            return true;
          });

          setSelectedSlotId(validSlot ? validSlot.id : null);
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load slots');
      } finally {
        if (showLoader) setIsLoading(false);
      }
    },
    [finalAmount]
  );



  useEffect(() => {
    fetchTimeSlots(selectedDate, true);
  }, [selectedDate, fetchTimeSlots]);

  const CheckoutMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(
        'https://api.apnifarming.com/user/checkout/submit.php',
        payload
      );
     
      
      
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success && data.order_id) {
        toast.success('Order created successfully!');
        useCartStore.getState().clearCart();
        setCheckout(false);
      }
    },
    onError: (error) => {
      toast.error(
        'Failed to create order: ' +
          (error.response?.data?.message || error.message)
      );
    },
  });

  const handleCheckout = () => {
    if (!selectedSlotId || !address || !user?.id) {
      toast.error(
        'Please select a delivery slot and address before proceeding.'
      );
      return;
    }

    
    const selectedSlot = timeSlots.find((slot) => slot.id === selectedSlotId);

    if (!selectedSlot) {
      toast.error('Invalid slot selected');
      return;
    }

  
   
    
    const orderPayload = {
      user_token: null,
      user_id: user.id,
      phone: user.phone,
      first_name: user.first_name,
      payment_method: 'cod',
      total_price: finalAmount,
      final_price: finalAmount,
      tax: gstAmount,
      shipping_price: deliveryCharge,
      coupon_code: couponCode || 'Not Selected',
      discount: couponDiscount,
      shipping_address: address.street_address,
      shipping_city: address.city,
      shipping_postalcode: address.pincode,
      delivery_date: selectedDate, // ✅ already a string
      delivery_from_time: selectedSlot.start_time,
      delivery_to_time: selectedSlot.end_time,
      shipping_state: address.state,
      shipping_country: 'India',
      delivey_instruction: "",
      order_items: cart.map((item) => ({
        product_id: Number(item.id),
        product_name: item.name,
        product_qty: item.quantity,
        variant_name:
          (item.selectedSize?.size || '') +
          ' ' +
          (item.selectedSize?.option || ''),
        variant_id: item.selectedSize?.id,
        mrp: item.costPrice,
        sale_price: item.price,
      })),
    };

    CheckoutMutation.mutate(orderPayload);
  };

  return (
    <div className="h-full relative p-4">
      {/* Close Button */}
      <button
        onClick={() => setCheckout(false)}
        className="bg-black text-white w-[100px] absolute top-1 right-1 px-2 rounded-full py-1"
      >
        Close
      </button>

      {/* Cart */}
      <CartPage />

      {/* Date Picker */}
      <div className="px-6">
        <label className="block font-medium mb-1">
          📅 Select Delivery Date:
        </label>
        <input
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      {/* Delivery Slots */}
      {isLoading ? (
        <p className="px-6 mt-4">Loading slots...</p>
      ) : (
       <div className='flex justify-between items-center'> <DeliverySlotSelector
          slots={timeSlots}
          selectedDate={new Date(selectedDate)}
          selectedSlotId={selectedSlotId}
          setSelectedSlotId={setSelectedSlotId}
        />
        
        
        </div>
        
      )}
      <OrderSummary/>

      {/* Checkout Button */}
      <div className="mt-6 px-6">
        <button
          onClick={handleCheckout}
          disabled={!selectedSlotId}
          className={`px-4 py-2 rounded text-white w-full ${
            selectedSlotId
              ? 'bg-blue-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {CheckoutMutation.isPending ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
