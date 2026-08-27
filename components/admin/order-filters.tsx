"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

export function OrderFilters({
  currentFilters,
}: {
  currentFilters: { search: string; paymentStatus: string; fulfillmentStatus: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(currentFilters.search);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`?${createQueryString("search", search)}`);
  };

  const handleClear = () => {
    setSearch("");
    router.push("?");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-md border">
      <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 w-full max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders or email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Select
          value={currentFilters.paymentStatus || "all"}
          onValueChange={(val) => router.push(`?${createQueryString("payment_status", val === "all" ? "" : val)}`)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.fulfillmentStatus || "all"}
          onValueChange={(val) => router.push(`?${createQueryString("fulfillment_status", val === "all" ? "" : val)}`)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Fulfillment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fulfillment</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {(currentFilters.search || currentFilters.paymentStatus || currentFilters.fulfillmentStatus) && (
          <Button variant="ghost" size="icon" onClick={handleClear} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
