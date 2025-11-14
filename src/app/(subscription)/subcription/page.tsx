'use client';
import React from 'react';
import { useAllSubscription } from './hooks';
import { Loader } from '@/components/Loader';
import SubscriptionsList from './components/SubscriptionsList';

const Page = () => {

  interface Subscription {
    id: number;
    user_id: number;
    first_name: string;
    phone: string;
    frequency: string;
    start_date: string | Date;
    billing_days: number;
    next_order_date: string | Date;
    address_title: string;
    street_address: string;
    city: string;
    state: string;
    pincode: string | number;
    landmark?: string;
    status: number;
  }
  const { data:subsData, isLoading, isError } = useAllSubscription();

  const subscriptions: Subscription[] = (subsData as Subscription[]) || [];


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
     {subscriptions.map((sub,i)=><SubscriptionsList key={i} sub={sub} />)}
    </div>
  );
};

export default Page;
