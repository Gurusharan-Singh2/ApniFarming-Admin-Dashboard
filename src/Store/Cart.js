import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Remove AsyncStorage import for Next.js

const useCartStore = create(
  persist(
    immer((set, get) => ({
      cart: [],
      totalAmount: 0,
      discount: 0,
      finalAmount: 0,
      totalItems: 0,
      couponCode: null,
      couponDiscount: 0,
      couponMessage: null,
      deliveryCharge: 0,
      gstAmount: 0,

      calculateTotals: () => {
        const { cart, couponDiscount, deliveryCharge, gstAmount } = get();

        const total = cart.reduce((sum, item) => sum + (item.costPrice || 0) * item.quantity, 0);
        const discount = cart.reduce((sum, item) => sum + (item.discount || 0) * item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        const baseAmount = Math.max(subtotal - couponDiscount, 0);
        const final = baseAmount + deliveryCharge + gstAmount;

        set((state) => {
          state.totalAmount = total;
          state.discount = discount;
          state.totalItems = totalItems;
          state.finalAmount = final;
        });
      },

      addToCart: (item) => {
        set((state) => {
          const normalizedId = Number(item.id);
          const sizeId = Number(item.selectedSize?.id);

          const existingItem = state.cart.find(
            (i) => Number(i.id) === normalizedId && Number(i.selectedSize?.id) === sizeId
          );

          const costPrice = item.selectedSize?.costPrice || 0;
          const sellPrice = item.selectedSize?.sellPrice || 0;
          const discount = costPrice - sellPrice;

          if (existingItem) {
            existingItem.quantity += 1;
            existingItem.selectedSize = { ...item.selectedSize, id: sizeId };
            existingItem.price = sellPrice;
            existingItem.costPrice = costPrice;
            existingItem.discount = discount;
          } else {
            state.cart.push({
              ...item,
              id: normalizedId,
              selectedSize: { ...item.selectedSize, id: sizeId },
              quantity: 1,
              price: sellPrice,
              costPrice,
              discount,
            });
          }
        });
        get().calculateTotals();
      },

      removeFromCart: (id, sizeId) => {
        set((state) => {
          state.cart = state.cart.filter(
            (item) => !(item.id === id && item.selectedSize?.id === sizeId)
          );
        });
        get().calculateTotals();
      },

      increment: (id, sizeId) => {
        set((state) => {
          const item = state.cart.find(
            (i) => Number(i.id) === Number(id) && Number(i.selectedSize?.id) === Number(sizeId)
          );

          if (item) {
            item.quantity += 1;
          }
        });
        get().calculateTotals();
      },

      decrement: (id, sizeId) => {
        set((state) => {
          const index = state.cart.findIndex(
            (i) => Number(i.id) === Number(id) && Number(i.selectedSize?.id) === Number(sizeId)
          );

          if (index !== -1) {
            const item = state.cart[index];
            if (item.quantity > 1) {
              item.quantity -= 1;
            } else {
              state.cart.splice(index, 1);
            }
          }
        });
        get().calculateTotals();
      },

      clearCart: () => {
        set((state) => {
          state.cart = [];
          state.totalAmount = 0;
          state.discount = 0;
          state.finalAmount = 0;
          state.totalItems = 0;
          state.couponCode = null;
          state.couponDiscount = 0;
          state.couponMessage = null;
          state.deliveryCharge = 0;
          state.gstAmount = 0;
        });
      },

      applyCouponFromBackend: (couponData) => {
        const { code, discount, final_total, message } = couponData;
        set((state) => {
          state.couponCode = code;
          state.couponDiscount = discount;
          state.couponMessage = message;
        });
        get().calculateTotals();
      },

      removeCoupon: () => {
        set((state) => {
          state.couponCode = null;
          state.couponDiscount = 0;
          state.couponMessage = null;
        });
        get().calculateTotals();
      },

      applyChargesFromBackend: (data) => {
        const { delivery_charge = 0, gst = 0 } = data;
        set((state) => {
          state.deliveryCharge = delivery_charge;
          state.gstAmount = gst;
        });
        get().calculateTotals();
      },

      revalidateCoupon: async (applyCouponFn) => {
        const { couponCode, finalAmount } = get();
        if (!couponCode) return;

        try {
          const payload = {
            code: couponCode,
            cart_total: finalAmount,
          };

          const data = await applyCouponFn.mutateAsync(payload);

          if (data?.success === true || data?.success === 'true') {
            get().applyCouponFromBackend(data);
          } else {
            get().removeCoupon();
            // Handle toast outside the store in your React component
          }
        } catch (err) {
          console.error('Coupon revalidation failed:', err);
        }
      },
    })),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage), // <-- use localStorage here
    }
  )
);

export default useCartStore;
