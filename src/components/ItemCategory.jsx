'use client';

import React from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchCategories = async () => {
  const { data } = await axios.get(
    `https://api.apnifarming.com/user/categories/getAllCategories.php`
  );
  return [
    {
      id: 0,
      name: 'All',
      image:
        'https://jobdsco.s3.ap-south-1.amazonaws.com/public/s550_4xb7_231012.jpg',
    },
    ...data,
  ];
};



const CategoryItem = ({ setCategoryId, a }) => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  return (
    <div className='my-4 py-4 bg-white dark:bg-neutral-900 text-black dark:text-white'>
      <h2 className="text-xl font-bold mb-2 px-5 py-3 text-black dark:text-white">Shop By Category</h2>

      {isLoading && <p className="px-5 text-black dark:text-white">Loading categories...</p>}
      {error && <p className="px-5 text-red-500 dark:text-red-400">Failed to load categories</p>}

      {!isLoading && !error && categories && (
        <div className="flex gap-5 overflow-x-auto w-full space-x-3 px-2 py-4">
          {categories.map((item) => {
            const isActive = item.id === a;
            return (
              <button
                key={item.id}
                onClick={() => setCategoryId(item.id)}
                className={`
                  flex-shrink-0 w-[90px] min-h-[112px] flex flex-col items-center p-1 rounded-lg transition 
                  ${isActive ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-600' : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-800'}
                  hover:scale-105 hover:shadow-md
                `}
              >
                <div className="w-full h-24 relative rounded-lg overflow-hidden bg-white dark:bg-neutral-800">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <p
                  className={`
                    text-center font-semibold text-[11px] mt-1 mb-0 
                    ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-200'}
                  `}
                >
                  {item.name}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryItem;
