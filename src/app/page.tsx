import { AreaChartt } from '@/components/charts/AreaChart';
import { DailyOrders } from '@/components/charts/DailyOrders';
import { RevenueLineChart } from '@/components/charts/RevenueLineChart';
import {  RevenuePieChart } from '@/components/charts/RevenuePieChart';
import { EmployeeCards } from '@/components/EployeeInfo';
import TodoList from '@/components/TodoList';
import React from 'react';

const Home = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
      {/* Main Overview - spans 2 columns on larger screens */}
      <div className="bg-primary-foreground p-4 rounded-lg sm:col-span-2 2xl:col-span-2">
       <DailyOrders/>
      </div>

      {/* Single stat cards */}
      <div className="bg-primary-foreground p-4 rounded-lg">
       <RevenueLineChart/>
      </div>

      <div className="bg-primary-foreground  rounded-lg xl:col-span-1 2xl:col-span-2">
       <RevenuePieChart/>
      </div>

      {/* Recent Activity - spans 2 columns on 2XL */}
      <div className="bg-primary-foreground p-4 rounded-lg xl:col-span-2 2xl:col-span-2">
       <AreaChartt/>
      </div>
     

      {/* More Info or Placeholder Card */}
     
       <div className="bg-primary-foreground p-4 rounded-lg xl:col-span-2 2xl:col-span-2">
      <EmployeeCards/>
      </div>


       <div className="bg-primary-foreground p-4 rounded-lg">
       <TodoList/>
      </div>
    </div>
  );
};

export default Home;
