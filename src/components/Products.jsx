'use client'
import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProductCard from "./ProductCard";
import useCartStore from "../Store/Cart";

const fetchProducts = async () => {
  const res = await axios.get("https://api.apnifarming.com/user/products/getAllProducts.php");
  return res.data;
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-8 h-8 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
}

function Products() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const {
    data: allProducts,
    isLoading: allLoading,
    isError: allError,
    isFetching: allFetching,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: searchResults = [],
    isLoading: searchLoading,
    isError: searchError,
  } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      const res = await axios.get(
        `https://api.apnifarming.com/user/products/search.php?q=${debouncedQuery}`
      );
      return res.data.data || [];
    },
    enabled: debouncedQuery.length >= 2,
  });

  const { cart } = useCartStore();

  const renderItem = useCallback(
    (item) => <ProductCard key={item.id} item={item} />,
    []
  );

  const showSearchResults = debouncedQuery.length >= 2;

  const isLoading = showSearchResults ? searchLoading : allLoading && !allFetching;
  const isError = showSearchResults ? searchError : allError;
  const productsToShow = showSearchResults ? searchResults : allProducts;

  if (isLoading) return <Spinner />;

  if (isError)
    return (
      <p className="px-5 py-4 text-center text-red-600 text-sm font-medium">
        {showSearchResults ? "Failed to search products." : "Failed to load products."}
      </p>
    );

  return (
    <div className="flex flex-col gap-4">
      {/* Search Bar */}
      <div className="px-4">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          aria-label="Search products"
        />
      </div>

      {/* Products Grid */}
      <ScrollArea className="h-[80vh] w-full">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5 px-4 pb-10">
          {productsToShow && productsToShow.length > 0 ? (
            productsToShow.map(renderItem)
          ) : (
            <p className="text-sm text-gray-500 col-span-4 text-center mt-8">
              {showSearchResults ? "No products found for your search." : "No products found."}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default React.memo(Products);
