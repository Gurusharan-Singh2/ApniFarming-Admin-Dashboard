'use client'
import React, { useState, useMemo } from "react";
import { Plus, Minus, ChevronDown } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useRouter } from "next/navigation";

import useCartStore from "../Store/Cart";
import { toast } from "react-toastify";

export default function ProductCard({ item }) {
  const router = useRouter();
  const { addToCart, cart, increment, decrement } = useCartStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(item?.sizes?.[0]);

const quantity = useMemo(
  () =>
    cart.find(
      (i) =>
        Number(i.id) === Number(item?.id) &&
        Number(i.selectedSize?.id) === Number(selectedSize?.id)
    )?.quantity || 0,
  [cart, item?.id, selectedSize?.id]
);


  const handleAddToCart = () => {
    addToCart({
      ...item,
      selectedSize: { ...selectedSize, id: Number(selectedSize.id) },
      price: selectedSize.sellPrice,
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <Card
      className="relative p-0  shadow-md hover:shadow-lg transition cursor-pointer gap-1"
      
    >
      {/* Product image */}
      <div className="relative">
        <img
          src={item?.image}
          alt={item?.name}
          className="w-full  object-contain"
        />
      </div>

      <CardHeader className="p-1 pb-0">
        <p className="text-xs font-semibold line-clamp-2">{item?.name}</p>
        
      </CardHeader>

      <CardContent className="p-1 pt-0">
        {/* Price */}
        <div className="flex items-center gap-1 ">
          {selectedSize?.discount && (
            <span className="line-through text-sm text-gray-500">
              ₹{selectedSize?.costPrice}
            </span>
          )}
          <span className="text-green-600 font-bold">
            ₹{selectedSize?.sellPrice}
          </span>
        </div>

        {/* Size selector */}
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between"
          disabled={quantity > 0}
          onClick={() => {
           
            setModalOpen(true);
          }}
        >
          {selectedSize?.size + " " + selectedSize?.option?.toLowerCase()}
          <ChevronDown className="w-4 h-4" />
        </Button>

        {/* Cart controls */}
        {quantity === 0 ? (
          <Button
            className="w-full mt-4"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center justify-between bg-green-600 text-white rounded-full px-3 py-1 mt-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={(e) => {
                e.stopPropagation();
                decrement(item.id, selectedSize.id);
              }}
            >
              <Minus />
            </Button>
            <span>{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  !selectedSize?.maxOrder ||
                  quantity < selectedSize?.maxOrder
                ) {
                  increment(item.id, selectedSize.id);
                } else {
                  toast.error("Max quantity reached");
                }
              }}
            >
              <Plus />
            </Button>
          </div>
        )}
      </CardContent>

      {/* Size selection modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Size</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            {item?.sizes?.map((sizeObj) => {
              const isSelected = selectedSize?.id === sizeObj?.id;
              return (
                <div
                  key={sizeObj.id}
                  className={`p-3 mb-2 rounded-lg cursor-pointer border ${
                    isSelected ? "bg-green-100 border-green-400" : "bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedSize(sizeObj);
                    setModalOpen(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm ${
                        isSelected
                          ? "text-green-800 font-bold"
                          : "text-gray-700"
                      }`}
                    >
                      {sizeObj?.size + " " + sizeObj?.option?.toLowerCase()}
                    </span>
                    <span
                      className={`text-sm ${
                        isSelected
                          ? "text-green-800 font-bold"
                          : "text-gray-600"
                      }`}
                    >
                      ₹{sizeObj?.sellPrice}
                    </span>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
