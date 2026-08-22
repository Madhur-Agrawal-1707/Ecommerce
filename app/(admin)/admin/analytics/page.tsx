import { createClient } from "@/lib/supabase/server";
import { RevenueChart } from "@/components/admin/analytics/revenue-chart";
import { TopProductsChart } from "@/components/admin/analytics/top-products-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export const metadata = {
  title: "Analytics | Admin Dashboard",
};

export default async function AnalyticsPage() {
  const supabase = createClient();
  
  // Last 30 days
  const endDate = endOfDay(new Date());
  const startDate = startOfDay(subDays(endDate, 29));

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
  // Initialize all 30 days to 0
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(endDate, 29 - i), "MMM dd");
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Store performance over the last 30 days.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders (30d)</CardTitle>
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
            <div className="text-2xl font-bold">₹{avgOrderValue.toFixed(2)}</div>
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
