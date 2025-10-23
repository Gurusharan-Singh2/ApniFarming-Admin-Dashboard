// components/orders/LoaderOverlay.tsx
import React from "react";

export const LoaderOverlay: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4 shadow-lg">
        <div className="w-12 h-12 border-4 border-t-green-600 border-gray-200 rounded-full animate-spin"></div>
        <p className="text-gray-700 font-medium text-lg">{message}</p>
      </div>
    </div>
  );
};
