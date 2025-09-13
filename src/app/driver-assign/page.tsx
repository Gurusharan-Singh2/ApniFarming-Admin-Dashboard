"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import axios from "axios";
import dayjs from "dayjs";

type Order = {
  id: number;
  firstName: string;
  orderStatus: string;
  deliveryDate: string;
};

type Driver = {
  id: number;
  name: string;
};

const fetchOrders = async (): Promise<Order[]> => {
  const response = await axios.get(
    "https://api.apnifarming.com/user/admin/orderlist.php?page=1&limit=50"
  );
  return (
    response?.data?.orders?.map((o: any) => ({
      id: o.id,
      firstName: o.first_name,
      orderStatus: o.order_status,
      deliveryDate: o.delivery_date,
    })) ?? []
  );
};

const fetchDrivers = async (): Promise<Driver[]> => {
  // Assuming there is a driver list API (replace with actual if available)
  const response = await axios.get(
    "https://api.apnifarming.com/user/admin/driverlist.php"
  );
  return (
    response?.data?.drivers?.map((d: any) => ({
      id: d.id,
      name: d.name,
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

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
  });

  const assignMutation = useMutation({
    mutationFn: assignDriver,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedOrders([]);
      setSelectedDriver("");
    },
  });

  const toggleOrderSelection = useCallback((id: number) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  }, []);

  if (ordersLoading || driversLoading) return <p>Loading...</p>;

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>Assign Drivers to Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Driver Selection */}
        <div className="mb-4">
          <Select
            value={selectedDriver}
            onValueChange={setSelectedDriver}
          >
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select Driver" />
            </SelectTrigger>
            <SelectContent>
              {drivers?.map((driver) => (
                <SelectItem key={driver.id} value={driver.id.toString()}>
                  {driver.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="flex flex-col gap-3 mb-4">
          {orders?.map((order) => (
            <Card key={order.id} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => toggleOrderSelection(order.id)}
                />
                <div>
                  <p className="font-medium">{order.firstName}</p>
                  <p className="text-sm text-muted-foreground">
                    {dayjs(order.deliveryDate).format("DD MMM YYYY")} • {order.orderStatus}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Assign Button */}
        <Button
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
      </CardContent>
    </Card>
  );
}
