'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProductCard from './ProductCard';

interface ProductsProps {
  a: number; // category ID
}

interface Product {
  id: number | string;
  name: string;
  price: number;
  image: string;
  // add other product fields as needed
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

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

const Products = ({ a }: ProductsProps) => {
  const [query, setQuery] = useState<string>('');
  const debouncedQuery = useDebounce(query, 500);

  // Fetch products for category
  const fetchProducts = async (): Promise<Product[]> => {
    if (a === 0) {
      const res = await axios.get(
        'https://api.apnifarming.com/user/products/getAllProducts.php'
      );
      return res.data;
    } else {
      const res = await axios.get(
        `https://api.apnifarming.com/user/categories/getProductsByCategory.php?id=${a}`
      );
      return res.data;
    }
  };

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isErrorProducts,
  } = useQuery<Product[]>({
    queryKey: ['products', a],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  // Search products
  const {
    data: searchResults = [],
    isLoading: isLoadingSearch,
    isError: isErrorSearch,
  } = useQuery<Product[]>({
    queryKey: ['search', debouncedQuery, a], // include categoryId in search
    queryFn: async () => {
      const res = await axios.get(
        `https://api.apnifarming.com/user/products/search.php?q=${debouncedQuery}&category=${a}`
      );
      return res.data.data || [];
    },
    enabled: debouncedQuery.length >= 2,
  });

  const showSearchResults = debouncedQuery.length >= 2;
  const productsToShow = showSearchResults ? searchResults : products;
  const loading = showSearchResults ? isLoadingSearch : isLoadingProducts;
  const error = showSearchResults ? isErrorSearch : isErrorProducts;

  if (loading) return <Spinner />;
  if (error)
    return (
      <p className="px-5 py-4 text-center text-red-600 text-sm font-medium">
        {showSearchResults ? 'Failed to search products.' : 'Failed to load products.'}
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
          {productsToShow.length > 0 ? (
            productsToShow.map((item) => <ProductCard key={item.id} item={item} />)
          ) : (
            <p className="text-sm text-gray-500 col-span-4 text-center mt-8">
              {showSearchResults ? 'No products found for your search.' : 'No products found.'}
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default React.memo(Products);
