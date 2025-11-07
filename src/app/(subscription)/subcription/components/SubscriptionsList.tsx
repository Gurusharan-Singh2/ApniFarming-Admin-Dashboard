"use client";
import React, { useState } from "react";
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

interface Props {
  data: Subscription[];
}

export default function SubscriptionsList({ data }: Props) {
  if (!data || data.length === 0)
    return (
      <p className="text-sm text-muted-foreground text-center mt-8">
        No subscriptions found.
      </p>
    );

  return (
    <div className="space-y-2.5">
      {data.map((sub, index) => (
        <SubscriptionCard
          key={`${sub.id}-${sub.user_id}-${index}`}
          sub={sub}
        />
      ))}
    </div>
  );
}

function SubscriptionCard({ sub }: { sub: Subscription }) {
  const [openItems, setOpenItems] = useState(false);

  const statusColor =
    sub.status === 1
      ? "bg-green-500/90 text-white"
      : "bg-red-500/80 text-white";

  return (
    <Card className="p-3 border border-muted/40 rounded-lg hover:shadow transition-all duration-150">
      <CardHeader className="pb-1 flex flex-row items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-sm font-semibold leading-tight">
            {sub.first_name}
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Phone: {sub.phone}
          </p>
        </div>
        <Badge className={`text-[10px] px-2 py-0.5 ${statusColor}`}>
          {sub.status === 1 ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>

      <CardContent className="pt-1 space-y-1.5">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-1">
          <Info label="Frequency" value={sub.frequency} />
          <Info label="Billing Days" value={sub.billing_days} />
          <Info
            label="Start Date"
            value={dayjs(sub.start_date).format("DD MMM YYYY")}
          />
          <Info
            label="Next Order"
            value={dayjs(sub.next_order_date).format("DD MMM YYYY")}
          />
          <Info
            label="Address"
            value={`${sub.street_address}, ${sub.city}`}
          />
          <Info label="Pincode" value={sub.pincode} />
        </div>

        <div className="flex justify-end mt-1">
          <Dialog open={openItems} onOpenChange={setOpenItems}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[11px]"
              >
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
                {/* TODO: map subscription items when available */}
                <div className="py-4 text-sm text-muted-foreground text-center">
                  Items data coming soon...
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
