"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import axios from "axios";
import dayjs from "dayjs";
import { Input } from "@/components/ui/input";

type Driver = {
  id: number;
  name: string;
  phone: string;
};

// -------------------- API --------------------

const fetchOrders = async ({ queryKey }: { queryKey: any }) => {
  const [_key, page, limit] = queryKey;
  const response = await axios.get(
    `https://api.apnifarming.com/user/admin/orderlist.php?page=${page}&limit=${limit}`
  );

  return {
    orders: response?.data?.orders ?? [],
    totalPages: response?.data?.total_pages ?? 1,
  };
};

const fetchDrivers = async (): Promise<Driver[]> => {
  const res = await axios.get(
    "https://api.apnifarming.com/user/admin/getalldriverlist.php"
  );
  return (
    res.data.drivers?.map((d: any) => ({
      id: Number(d.id),
      name: d.driver_name,
      phone: d.driver_phone_number,
    })) ?? []
  );
};

const assignDriver = async ({
  driverId,
  orderIds,
}: {
  driverId: number;
  orderIds: number[];
}) => {
  await axios.post(
    "https://api.apnifarming.com/user/admin/assigndriver.php",
    {
      driver_id: driverId,
      order_ids: orderIds,
    }
  );
};


export default function DriverAssignPage() {
  const queryClient = useQueryClient();
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>("");

  const [page, setPage] = useState(1);
const [limit,setLimit]=useState(10);

  
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all"); 
  const [driverFilter, setDriverFilter] = useState<string>("all"); 

 
  const { data, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", page, limit],
    queryFn: fetchOrders,
    staleTime: 0,
  });

  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
  });

  // Mutation
// Mutation
const assignMutation = useMutation({
  mutationFn: assignDriver,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });

    setSelectedOrders([]);
    setSelectedDriver("");
  },
});


  const orders = data?.orders ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filteredOrders = useMemo(() => {
    return orders.filter((o: any) => {
      if (assignmentFilter === "assigned" && !o.driver_name) return false;
      if (assignmentFilter === "unassigned" && o.driver_name) return false;

      if (driverFilter !== "all" && o.driver_id?.toString() !== driverFilter)
        return false;

      return true;
    });
  }, [orders, assignmentFilter, driverFilter]);

  const toggleOrderSelection = useCallback((id: number) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  }, []);

  const toggleAllOrders = useCallback(() => {
    const currentPageIds = filteredOrders.map((o: any) => o.id);
    const allSelected = currentPageIds.every((id: any) =>
      selectedOrders.includes(id)
    );
    if (allSelected) {
      setSelectedOrders((prev) =>
        prev.filter((id) => !currentPageIds.includes(id))
      );
    } else {
      setSelectedOrders((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  }, [filteredOrders, selectedOrders]);

  if (ordersLoading || driversLoading) return <p>Loading...</p>;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Assign Drivers to Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-10 items-center">
          <Select value={selectedDriver} onValueChange={setSelectedDriver}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select Driver to Assign" />
            </SelectTrigger>
            <SelectContent>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id.toString()}>
                  {driver.name} ({driver.phone})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="mt-4"
            disabled={
              assignMutation.isPending ||
              !selectedDriver ||
              selectedOrders.length === 0
            }
            onClick={() =>
              assignMutation.mutate({
                driverId: Number(selectedDriver),
                orderIds: selectedOrders,
              })
            }
          >
            {assignMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Assigning...</span>
              </div>
            ) : (
              "Assign Driver"
            )}
          </Button>

           <div className="flex items-center gap-2">
  <label className="text-sm text-muted-foreground">Limit:</label>
  <Input
    type="number"
    value={limit}
    onChange={(e) => {
      const val = parseInt(e.target.value) || 1;
      setLimit(val);
      setPage(1); 
    }}
    className="w-20"
    min={1}
  />
</div>
        </div>

        <div className="flex gap-4 mb-6">
          <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>

          <Select value={driverFilter} onValueChange={setDriverFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Driver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drivers</SelectItem>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id.toString()}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            checked={
              filteredOrders.length > 0 &&
              filteredOrders.every((o: any) => selectedOrders.includes(o.id))
            }
            onCheckedChange={toggleAllOrders}
          />
          <p className="text-sm">Select All Orders (Filtered)</p>
        </div>

        <div className="flex flex-col gap-3 mb-4 max-h-[95vh] overflow-y-auto">
          {filteredOrders.map((order: any) => (
            <Card
              key={order.id}
              className="p-3 bg-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2 w-full">
                <Checkbox
                className="bg-yellow-300"
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => toggleOrderSelection(order.id)}
                />
                <div className="flex justify-between w-full">
                  <div>
                    <p className="font-medium">{order.first_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {dayjs(order.deliveryDate).format("DD MMM YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-base">
                      {order?.driver_name ? (
                        <span className="text-green-500 font-bold text-sm">
                          {order?.driver_name}
                        </span>
                      ) : (
                        <span className="text-red-500 text-sm">
                          Not Assigned
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filteredOrders.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No orders match your filters.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <p className="text-sm">
            Page {page} of {totalPages}
          </p>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
