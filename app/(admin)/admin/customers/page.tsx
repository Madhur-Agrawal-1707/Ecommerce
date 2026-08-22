import { createClient } from "@/lib/supabase/server";
import { CustomerList, CustomerRow } from "./customer-list";

export const metadata = {
  title: "Customers | Admin Dashboard",
};

export default async function CustomersPage() {
  const supabase = createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      created_at,
      orders (
        id,
        total,
        fulfillment_status
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error);
  }

  // Aggregate order data
  const customers: CustomerRow[] = (profiles || []).map((p: any) => {
    // Only count completed/paid/valid orders in LTV? 
    // We'll just sum all for now, or filter by not cancelled.
    const validOrders = p.orders?.filter((o: any) => o.fulfillment_status !== "cancelled") || [];
    
    const totalSpent = validOrders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);

    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      created_at: p.created_at,
      total_orders: validOrders.length,
      total_spent: totalSpent,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Manage your customers and view their purchase history.</p>
      </div>

      <CustomerList data={customers} />
    </div>
  );
}
