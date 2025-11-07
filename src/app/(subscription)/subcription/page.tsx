'use client';
import React from 'react';
import { useAllSubscription } from './hooks';
import { Loader } from '@/components/Loader';
import SubscriptionsList from './components/SubscriptionsList';

const Page = () => {
  const { data, isLoading, isError } = useAllSubscription();

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-500 text-sm">Failed to fetch subscriptions.</p>
      </div>
    );

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">All Subscriptions</h1>
      <SubscriptionsList data={(data as any[]) || []} />
    </div>
  );
};

export default Page;
