// components/orders/components/FiltersBar.tsx
import React, {  useMemo } from "react";
import debounce from "lodash.debounce";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { statusMap } from "../../../utils/statusMap"; 


type Props = {
  filters: any;
  setFilters: (fnOrVal: any) => void;
  slots: any[];
  slotsLoading: boolean;
  drivers: any[];
  driversLoading: boolean;
  onDownloadPDF: () => void;
  limit: number;
  setLimit: (n: number) => void;
};

export const FiltersBar: React.FC<Props> = ({
  filters,
  setFilters,
  slots,
  slotsLoading,
  drivers,
  driversLoading,
  onDownloadPDF,
  limit,
  setLimit,
}) => {
const debouncedSetSearch = useMemo(
  () =>
    debounce((v: string) => {
      setFilters((f: any) => ({ ...f, search: v }));
    }, 500),
  [setFilters]
);

  // Helper to safely handle “All” options
  const handleSelectChange = (key: string, value: string) => {
    setFilters((f: any) => ({
      ...f,
      [key]: value === "all" ? undefined : value,
    }));
  };

  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          placeholder="Search by name / phone / order ID"
          defaultValue={filters.search || ""}
          onChange={(e) => debouncedSetSearch(e.target.value)}
          className="w-[300px]"
        />

        <Input
          type="number"
          placeholder="Order ID"
          value={filters.orderId ?? ""}
          onChange={(e) =>
            setFilters((f: any) => ({ ...f, orderId: e.target.value }))
          }
          className="w-[150px]"
        />

        <div>
          <label className="block text-xs">From Date</label>
          <Input
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(e) =>
              setFilters((f: any) => ({ ...f, dateFrom: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-xs">To Date</label>
          <Input
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(e) =>
              setFilters((f: any) => ({ ...f, dateTo: e.target.value }))
            }
          />
        </div>

        {/* ✅ Fixed - no empty string value */}
        <Select
          value={filters.orderStatus ?? "all"}
          onValueChange={(v) => handleSelectChange("orderStatus", v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {Object.entries(statusMap).map(([key, s]) => (
              <SelectItem key={key} value={s.code.toString()}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.paymentStatus ?? "all"}
          onValueChange={(v) => handleSelectChange("paymentStatus", v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="0">Unpaid</SelectItem>
            <SelectItem value="1">Paid</SelectItem>
            <SelectItem value="2">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.driverId ?? "all"}
          onValueChange={(v) => handleSelectChange("driverId", v)}
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

        <Select
          value={filters.slot ?? "all"}
          onValueChange={(v) => handleSelectChange("slot", v)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by Slot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Slots</SelectItem>
            {slotsLoading ? (
              <SelectItem value="loading">Loading...</SelectItem>
            ) : (
              slots.map((s: any) => (
                <SelectItem key={s.id} value={s.start_time}>
                  {s.title} ({s.start_time} - {s.end_time})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() =>
            setFilters({
              search: "",
              uid: "",
              phone: "",
              orderId: "",
              dateFrom: "",
              dateTo: "",
              slot: undefined,
              driverId: undefined,
              orderStatus: undefined,
              paymentStatus: undefined,
            })
          }
        >
          Reset Filters
        </Button>

        <Button className="bg-green-600 text-white" onClick={onDownloadPDF}>
          Download PDF
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Limit:</label>
        <Input
          type="number"
          value={limit}
          onChange={(e) =>
            setLimit(Math.max(1, parseInt(e.target.value || "1")))
          }
          className="w-20"
          min={1}
        />
      </div>
    </div>
  );
};
