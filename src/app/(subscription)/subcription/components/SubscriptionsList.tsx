"use client";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCancelSubscription, useSubscriptionItems } from "../hooks";

export default function SubscriptionCard({ sub }: { sub: any }) {
  const [openItems, setOpenItems] = useState(false);
  const [openSkips, setOpenSkips] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  const {
    data: subscriptionItems = [],
    isPending,
    refetch,
    isFetched,
  } = useSubscriptionItems(sub?.id, { enabled: false }) as {
    data: any[];
    isPending: boolean;
    refetch: () => void;
    isFetched: boolean;
  };

  const {mutate:CancelMutate,isPending:cancelPending} =useCancelSubscription(setOpenCancel);

  const handleCancelSubscription=()=>{
    CancelMutate(Number(sub.subscription_id));
  }

  useEffect(() => {
    if (openItems && !isFetched) {
      refetch();
    }
  }, [openItems, isFetched, refetch]);

  const statusColor =
    sub?.status === 'active'
      ? "bg-green-500/90 text-white"
      : "bg-red-500/80 text-white";

  return (
    <Card className="p-3 border border-muted/40 rounded-lg hover:shadow transition-all duration-150">
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-sm font-semibold leading-tight">
            {sub?.first_name}
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Phone: {sub?.phone}
          </p>
        </div>
        <Badge className={`text-[10px] px-2 py-0.5 ${statusColor}`}>
          {sub?.status == 'active' ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent className="pt-1 space-y-2">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1">
          <Info label="Frequency" value={sub?.frequency} />
          <Info label="Billing Days" value={sub?.billing_days} />
          <Info
            label="Start Date"
            value={dayjs(sub?.start_date).format("DD MMM YYYY")}
          />
          <Info
            label="Next Order"
            value={dayjs(sub?.next_order_date).format("DD MMM YYYY")}
          />
          <Info label="Address" value={`${sub?.street_address}, ${sub?.city}`} />
          <Info label="Pincode" value={sub?.pincode} />
        </div>

        <div className="flex justify-end gap-2 mt-2">
         
          <Dialog open={openItems} onOpenChange={setOpenItems}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-3 text-[11px]">
                View Items
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  Subscription Items
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                {isPending ? (
                  <div className="py-4 text-sm text-muted-foreground text-center">
                    Loading items...
                  </div>
                ) : subscriptionItems.length > 0 ? (
                  <div className="space-y-2 py-2">
                    {subscriptionItems.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between border-b border-muted/40 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{item.name}</span>
                            <span className="text-[11px] text-muted-foreground">
                                ₹{item.cost}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs text-muted-foreground">
                          Qty: {item.quantity } {item.option}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-4 text-sm text-muted-foreground text-center">
                    No items found.
                  </div>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Skips Dialog */}
          <Dialog open={openSkips} onOpenChange={setOpenSkips}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-3 text-[11px]">
                View Skips
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  Skipped Dates
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="py-4 text-sm text-muted-foreground text-center">
                  Skips data coming soon...
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>


          {/* Cancelled Subscription  */}
           <Dialog open={openCancel} onOpenChange={setOpenCancel}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm"  className="h-7 px-3 text-[11px] ">
              Cancel Subscription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  Cancel Subscription
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <div className="py-4 text-sm text-muted-foreground text-center">
                <h2>Do you want to Cancel This Subscription ? </h2>
                <div className="flex-1 w-full flex justify-center items-center gap-4 mt-4">
                  <Button variant="destructive" size="sm"  className="h-7 px-3 text-[11px]" onClick={handleCancelSubscription}>Yes</Button>
                  <Button variant="outline" size="sm"  className="h-7 px-3 text-[11px]">No</Button>
                </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

const Info = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex flex-col leading-tight">
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
      {label}
    </span>
    <span className="text-[12px] font-medium text-foreground truncate">
      {value || "-"}
    </span>
  </div>
);
