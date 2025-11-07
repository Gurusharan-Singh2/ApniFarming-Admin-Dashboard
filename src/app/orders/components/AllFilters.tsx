"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FiltersProps {
  filters: any;
  setFilters: (f: any) => void;
  resetFilters: () => void;
  debouncedSetSearch: (v: string) => void;
  slots: any[];
  slotLoading: boolean;
  drivers: any[];
  driversLoading: boolean;
  statusMap: Record<string, { label: string; code: number }>;
  onDownloadPDF: () => void;
  limit: number;
  setLimit: (v: number) => void;
}

const Filters: React.FC<FiltersProps> = ({
  filters,
  setFilters,
  resetFilters,
  debouncedSetSearch,
  slots,
  slotLoading,
  drivers,
  driversLoading,
  statusMap,
  onDownloadPDF,
  limit,
  setLimit,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap gap-1 items-center">
        <Input
          placeholder="Search by name / phone / order ID"
          defaultValue={filters.search}
          onChange={(e) => debouncedSetSearch(e.target.value)}
          className="w-[300px]"
        />

        <Input
          type="number"
          placeholder="Order ID"
          value={filters.orderId}
          onChange={(e) => setFilters((f: any) => ({ ...f, orderId: e.target.value }))}
          className="w-40"
        />

        {/* Date Range */}
        <div>
          <h2>From Date:</h2>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((f: any) => ({ ...f, dateFrom: e.target.value }))}
            className="w-[170px]"
          />
        </div>

        <div>
          <h2>To Date:</h2>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((f: any) => ({ ...f, dateTo: e.target.value }))}
            className="w-[170px]"
          />
        </div>

        {/* Order Status */}
        <Select
          value={filters.orderStatus}
          onValueChange={(v) => setFilters((f: any) => ({ ...f, orderStatus: v }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusMap).map(([key, s]) => (
              <SelectItem key={key} value={s.code.toString()}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment Status */}
        <Select
          value={filters.paymentStatus}
          onValueChange={(v) => setFilters((f: any) => ({ ...f, paymentStatus: v }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Unpaid</SelectItem>
            <SelectItem value="1">Paid</SelectItem>
            <SelectItem value="2">Pending</SelectItem>
          </SelectContent>
        </Select>

        {/* Driver */}
        <Select
          value={filters.driverId || "all"}
          onValueChange={(v) => setFilters((f: any) => ({ ...f, driverId: v === "all" ? "" : v }))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {driversLoading ? (
              <SelectItem value="loading">Loading...</SelectItem>
            ) : (
              drivers.map((d: any) => (
                <SelectItem key={d.id} value={d.id.toString()}>
                  {d.driver_name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {/* Slot */}
        <Select
          value={filters.slot}
          onValueChange={(v) => setFilters((f: any) => ({ ...f, slot: v }))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Slot" />
          </SelectTrigger>
          <SelectContent>
            {slotLoading ? (
              <SelectItem value="">Loading...</SelectItem>
            ) : (
              slots.map((slot: any) => (
                <SelectItem key={slot.id} value={slot.start_time}>
                  {slot.title} ({slot.start_time} - {slot.end_time})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={resetFilters}>
          Reset Filters
        </Button>

        <Button onClick={onDownloadPDF} className="bg-green-600 text-white">
          Download PDF
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Limit:</label>
        <Input
          type="number"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value) || 1)}
          className="w-20"
          min={1}
        />
      </div>
    </div>
  );
};

export default Filters;
