import { createClient } from "@/lib/supabase/server";
import { RevenueChart } from "@/components/admin/analytics/revenue-chart";
import { TopProductsChart } from "@/components/admin/analytics/top-products-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardDateToggle } from "@/components/admin/dashboard-date-toggle";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export const metadata = {
  title: "Analytics | Admin Dashboard",
};

export default async function AnalyticsPage({
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

  // 1. Fetch Orders for Revenue chart
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("created_at, total")
    .eq("payment_status", "paid")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: true });

  // 2. Fetch Order Items for Top Products
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select(`
      quantity,
      line_total,
      product_name,
      orders!inner(payment_status, created_at)
    `)
    .eq("orders.payment_status", "paid")
    .gte("orders.created_at", startDate.toISOString())
    .lte("orders.created_at", endDate.toISOString());

  // Aggregate Revenue by Date
  const dailyRevenue: Record<string, number> = {};
  
  if (range === "1y") {
    // Monthly aggregation
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(endDate);
      d.setMonth(d.getMonth() - i);
      const key = format(d, "MMM yyyy");
      months.push(key);
      dailyRevenue[key] = 0;
    }
    if (orders) {
      orders.forEach(order => {
        const d = format(new Date(order.created_at), "MMM yyyy");
        if (dailyRevenue[d] !== undefined) dailyRevenue[d] += Number(order.total);
      });
    }
  } else {
    // Daily aggregation
    for (let i = 0; i < days; i++) {
      const d = format(subDays(endDate, days - 1 - i), "MMM dd");
      dailyRevenue[d] = 0;
    }
    if (orders) {
      orders.forEach(order => {
        const d = format(new Date(order.created_at), "MMM dd");
        if (dailyRevenue[d] !== undefined) {
          dailyRevenue[d] += Number(order.total);
        }
      });
    }
  }

  const revenueData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  // Aggregate Top Products by Units Sold
  const productAgg: Record<string, { units: number; revenue: number }> = {};
  
  if (orderItems) {
    orderItems.forEach(item => {
      const name = item.product_name;
      if (!productAgg[name]) {
        productAgg[name] = { units: 0, revenue: 0 };
      }
      productAgg[name].units += Number(item.quantity);
      productAgg[name].revenue += Number(item.line_total);
    });
  }

  const topProductsData = Object.entries(productAgg)
    .map(([name, data]) => ({
      name,
      units: data.units,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = orders?.length || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Store performance over the selected period.</p>
        </div>
        <DashboardDateToggle />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgOrderValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products (Units Sold)</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={topProductsData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
