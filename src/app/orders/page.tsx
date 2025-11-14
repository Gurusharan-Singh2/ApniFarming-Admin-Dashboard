"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import debounce from "lodash.debounce";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import { Loader } from "@/components/Loader";
import OrderRow from "./components/OrderRow";
import { handleDownloadPDF } from "./libs";
import { statusMap } from "./utils";
import {
  useFetchDriver,
  useFetchOrders,
  useFetchSlots,
  useOrderMutation,
  usePaymentMutaion,
} from "./hooks";
import PdfLoader from "./components/PdfLoader";
import Filters from "./components/AllFilters";
import BulkActions from "./components/BulkActions";




export default function OrdersComponent() {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);

  const Fromtoday = dayjs().format("YYYY-MM-DD");
  const today = dayjs().format("YYYY-MM-DD");

  const [filters, setFilters] = useState({
    search: "",
    uid: "",
    phone: "",
    orderId: "",
    dateFrom: Fromtoday,
    dateTo: today,
    slot: "",
    driverId: "",
    orderStatus: "",
    paymentStatus: "",
  });

  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const { data: slots = [], isLoading: slotLoading } = useFetchSlots();
  const { data, isFetching, isError } = useFetchOrders(page, limit, filters);
  const { data: drivers = [], isLoading: driversLoading } = useFetchDriver();

  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;

  console.log(orders);
  

  const Ordermutation = useOrderMutation(setSelectedOrders);

  const PaymentMutation = usePaymentMutaion();

  const toggleOrderSelection = useCallback((id: number) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  }, []);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilters((f) => ({ ...f, search: value }));
        setPage(1);
      }, 500),
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
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
  }, []);

  if (isPdfLoading) return <PdfLoader />;

  if (isFetching) return <Loader />;
  if (isError) return <p className="text-red-500">Failed to fetch orders.</p>;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Filters
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          debouncedSetSearch={debouncedSetSearch}
          slots={slots}
          slotLoading={slotLoading}
          drivers={drivers}
          driversLoading={driversLoading}
          statusMap={statusMap}
          onDownloadPDF={() =>
            handleDownloadPDF(filters, limit, setIsPdfLoading)
          }
          limit={limit}
          setLimit={(v) => {
            setLimit(v);
            setPage(1);
          }}
        />

        <BulkActions
          selectedOrders={selectedOrders}
          orders={orders}
          statusMap={statusMap}
          OrderMutation={Ordermutation}
          PaymentMutation={PaymentMutation}
          clearSelection={() => setSelectedOrders([])}
        />

        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              selected={selectedOrders.includes(order.id)}
              toggleOrderSelection={toggleOrderSelection}
              mutation={Ordermutation}
              paymentMutation={PaymentMutation}
            />
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <p className="text-sm">
            Page {page} of {totalPages}
          </p>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
