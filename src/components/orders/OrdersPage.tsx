// components/orders/OrdersPage.tsx
"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrdersData } from "./hooks/useOrder";
import { useOrderMutations } from "./hooks/useOrderMutation";
import { FiltersBar } from "./components/FiltersBar";
import { BulkActions } from "./components/BulkActions";
import { OrderRow } from "./components/OrderRow";
import { LoaderOverlay } from "./LoaderOverlay";
import { Loader } from "@/components/Loader";
import { handleDownloadPDF } from "../../utils/pdfUtils";

export default function OrdersPage() {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(100);
  const [filters, setFilters] = useState<any>({
    search: "",
    uid: "",
    phone: "",
    orderId: "",
    dateFrom: "",
    dateTo: "",
    slot: "",
    driverId: "",
    orderStatus: "",
    paymentStatus: "",
  });
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const { ordersQuery, slotsQuery, driversQuery } = useOrdersData(page, limit, filters);
  const { orderMutation, paymentMutation } = useOrderMutations();

  const data = ordersQuery.data ?? { orders: [], totalPages: 1 };
  const orders = data.orders ?? [];
  const totalPages = data.totalPages ?? 1;

  const toggleOrderSelection = useCallback((id: number) => {
    setSelectedOrders(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  }, []);

  const handleDownload = useCallback(() => {
    handleDownloadPDF(filters, limit, setIsPdfLoading);
  }, [filters, limit]);

  if (isPdfLoading) return <LoaderOverlay message="Generating PDF..." />;
  if (ordersQuery.isFetching) return <Loader />;
  if (ordersQuery.isError) return <p className="text-red-500">Failed to fetch orders.</p>;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <FiltersBar
          filters={filters}
          setFilters={setFilters}
          slots={slotsQuery.data ?? []}
          slotsLoading={slotsQuery.isLoading}
          drivers={driversQuery.data ?? []}
          driversLoading={driversQuery.isLoading}
          onDownloadPDF={handleDownload}
          limit={limit}
          setLimit={setLimit}
        />

        <BulkActions
          selectedOrders={selectedOrders}
          setSelectedOrders={setSelectedOrders}
          orderMutation={orderMutation}
          paymentMutation={paymentMutation}
          orders={orders}
        />

        <div className="flex flex-col gap-3">
          {orders.map((order: any) => (
            <OrderRow
              key={order.id}
              order={order}
              selected={selectedOrders.includes(order.id)}
              toggleOrderSelection={toggleOrderSelection}
              mutation={orderMutation}
              paymentMutation={paymentMutation}
            />
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            Previous
          </Button>

          <p className="text-sm">Page {page} of {totalPages}</p>

          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
