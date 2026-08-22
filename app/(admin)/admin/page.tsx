import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { DashboardDateToggle } from "@/components/admin/dashboard-date-toggle";
import { RevenueChart } from "@/components/admin/analytics/revenue-chart";
import { TopProductsChart } from "@/components/admin/analytics/top-products-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, startOfDay, endOfDay, subYears } from "date-fns";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const supabase = createClient();
  const range = searchParams.range || "30d";
  
  const endDate = endOfDay(new Date());
  let days = 30;
  if (range === "7d") days = 7;
  else if (range === "90d") days = 90;
  else if (range === "1y") days = 365;

  const startDate = startOfDay(subDays(endDate, days - 1));
  const prevEndDate = startOfDay(subDays(endDate, days));
  const prevStartDate = startOfDay(subDays(prevEndDate, days - 1));

  // --- Fetch Data ---
  const [currentOrdersRes, prevOrdersRes, recentOrdersRes, topProductsRes, lowStockRes, currentCustomersRes, prevCustomersRes] = await Promise.all([
    // Current period orders
    supabase
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "paid")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: true }),
    
    // Previous period orders
    supabase
      .from("orders")
      .select("total")
      .eq("payment_status", "paid")
      .gte("created_at", prevStartDate.toISOString())
      .lte("created_at", prevEndDate.toISOString()),
    
    // Recent 10 orders
    supabase
      .from("orders")
      .select("id, order_number, email, total, payment_status, fulfillment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    
    // Order items for Top Products
    supabase
      .from("order_items")
      .select(`
        quantity,
        line_total,
        title,
        variant_info,
        orders!inner(payment_status, created_at)
      `)
      .eq("orders.payment_status", "paid")
      .gte("orders.created_at", startDate.toISOString())
      .lte("orders.created_at", endDate.toISOString()),

    // Low stock
    supabase
      .from("products")
      .select("id, title, stock_quantity")
      .lt("stock_quantity", 10)
      .eq("status", "active")
      .order("stock_quantity", { ascending: true }),
      
    // New Customers current
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString()),
      
    // New Customers prev
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", prevStartDate.toISOString())
      .lte("created_at", prevEndDate.toISOString()),
  ]);

  // --- Compute KPIs ---
  const currentOrders = currentOrdersRes.data || [];
  const prevOrders = prevOrdersRes.data || [];

  const currentRevenue = currentOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const prevRevenue = prevOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const currentAvgOrder = currentOrders.length ? currentRevenue / currentOrders.length : 0;
  const prevAvgOrder = prevOrders.length ? prevRevenue / prevOrders.length : 0;

  const currentCustomers = currentCustomersRes.count || 0;
  const prevCustomers = prevCustomersRes.count || 0;

  const getDelta = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return ((current - prev) / prev) * 100;
  };

  const revenueDelta = getDelta(currentRevenue, prevRevenue);
  const ordersDelta = getDelta(currentOrders.length, prevOrders.length);
  const avgOrderDelta = getDelta(currentAvgOrder, prevAvgOrder);
  const customersDelta = getDelta(currentCustomers, prevCustomers);

  // --- Compute Revenue Chart ---
  const dailyRevenue: Record<string, number> = {};
  
  if (range === "1y") {
    // Monthly aggregation
    for (let i = 0; i < 12; i++) {
      const d = format(subDays(endDate, i * 30), "MMM yyyy"); // roughly
      dailyRevenue[d] = 0;
    }
    // proper month generation
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(endDate);
      d.setMonth(d.getMonth() - i);
      const key = format(d, "MMM yyyy");
      months.push(key);
      dailyRevenue[key] = 0;
    }
    currentOrders.forEach(order => {
      const d = format(new Date(order.created_at), "MMM yyyy");
      if (dailyRevenue[d] !== undefined) dailyRevenue[d] += Number(order.total || 0);
    });
  } else {
    // Daily aggregation
    for (let i = 0; i < days; i++) {
      const d = format(subDays(endDate, days - 1 - i), "MMM dd");
      dailyRevenue[d] = 0;
    }
    currentOrders.forEach(order => {
      const d = format(new Date(order.created_at), "MMM dd");
      if (dailyRevenue[d] !== undefined) dailyRevenue[d] += Number(order.total || 0);
    });
  }

  const revenueData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  // --- Compute Top Products ---
  const productAgg: Record<string, { units: number; revenue: number }> = {};
  const orderItems = topProductsRes.data || [];
  
  orderItems.forEach(item => {
    // Use title, append variant info if exists (like color) to differentiate
    const variantInfo = item.variant_info as any;
    const name = variantInfo?.color ? `${item.title} (${variantInfo.color})` : item.title;
    
    if (!productAgg[name]) {
      productAgg[name] = { units: 0, revenue: 0 };
    }
    productAgg[name].units += Number(item.quantity || 0);
    productAgg[name].revenue += Number(item.line_total || 0);
  });

  const topProductsData = Object.entries(productAgg)
    .map(([name, data]) => ({
      name,
      units: data.units,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const recentOrders = recentOrdersRes.data || [];
  const lowStockProducts = lowStockRes.data || [];

  return (
    <div className="space-y-8">
      {/* Page heading & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your store at a glance — live data from Supabase.
          </p>
        </div>
        <DashboardDateToggle />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${currentRevenue.toLocaleString("en-IN")}`}
          delta={revenueDelta}
        />
        <StatCard
          title="Total Orders"
          value={currentOrders.length}
          delta={ordersDelta}
        />
        <StatCard
          title="New Customers"
          value={currentCustomers}
          delta={customersDelta}
        />
        <StatCard
          title="Avg Order Value"
          value={`₹${Math.round(currentAvgOrder).toLocaleString("en-IN")}`}
          delta={avgOrderDelta}
        />
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p>
              <strong>{lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""}</strong>{" "}
              {lowStockProducts.length !== 1 ? "are" : "is"} running low on stock (less than 10 units).
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {lowStockProducts.slice(0, 5).map(p => (
                <Link key={p.id} href={`/admin/products/${p.id}/edit`} className="underline hover:text-amber-900 truncate max-w-[200px]">
                  {p.title} ({p.stock_quantity})
                </Link>
              ))}
              {lowStockProducts.length > 5 && <span>and {lowStockProducts.length - 5} more...</span>}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={topProductsData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/admin/orders" className="text-sm flex items-center text-primary hover:underline">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground border border-dashed rounded-md">
              No orders found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="hover:underline text-primary">
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="truncate max-w-[150px]">{order.email}</TableCell>
                    <TableCell>
                      <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{Number(order.total).toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
