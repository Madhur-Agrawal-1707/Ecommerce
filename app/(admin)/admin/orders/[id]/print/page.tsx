import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { PrintAction } from "./print-action";

export default async function PrintInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("id", params.id)
    .single();

  if (error || !order) {
    notFound();
  }

  // Placeholder store details
  const storeDetails = {
    name: "Noir & Gold",
    addressLine1: "123 Saree Elegance Road",
    addressLine2: "Varanasi, UP, 221001",
    gstin: "09AAACC1234D1Z5",
    email: "contact@noirandgold.com",
    phone: "+91-9876543210"
  };

  const shipping = order.shipping_address || {};

  return (
    <div className="bg-white min-h-screen text-black font-sans print:m-0 print:p-0 p-8 max-w-[210mm] mx-auto">
      {/* Print Trigger Component */}
      <PrintAction />
      
      <div className="mb-8 print:hidden flex justify-end">
        <button 
          id="manual-print-btn"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded shadow hover:bg-primary/90 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Document
        </button>
      </div>

      {/* ----------------- SHIPPING LABEL ----------------- */}
      <div className="border-2 border-black p-6 rounded-md mb-12 break-inside-avoid">
        <div className="flex justify-between items-start border-b border-black pb-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-widest">{storeDetails.name}</h1>
            <p className="text-sm font-medium mt-1">SHIPPING LABEL</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">Order #{order.order_number}</p>
            <p className="text-sm text-gray-600">Date: {format(new Date(order.created_at), "dd MMM yyyy")}</p>
            <p className="text-sm font-semibold mt-1 uppercase border border-black inline-block px-2 py-0.5 mt-2 rounded">
              {order.shipping_method}
            </p>
          </div>
        </div>

        <div className="flex justify-between gap-8">
          {/* TO */}
          <div className="flex-1">
            <h2 className="font-bold text-gray-500 mb-2 uppercase text-sm">Ship To:</h2>
            <div className="font-bold text-lg">{shipping.full_name || "Guest User"}</div>
            <div className="text-base leading-relaxed mt-1">
              {shipping.address_line1}<br />
              {shipping.address_line2 && <>{shipping.address_line2}<br /></>}
              {shipping.city}, {shipping.state} {shipping.zip}<br />
              {shipping.country}
            </div>
            {shipping.phone && (
              <div className="mt-3 font-semibold text-sm">
                Phone: {shipping.phone}
              </div>
            )}
          </div>

          {/* FROM */}
          <div className="w-64 border-l border-gray-300 pl-8">
            <h2 className="font-bold text-gray-500 mb-2 uppercase text-sm">Return Address:</h2>
            <div className="font-bold text-base">{storeDetails.name}</div>
            <div className="text-sm leading-relaxed mt-1">
              {storeDetails.addressLine1}<br />
              {storeDetails.addressLine2}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              If undelivered, please return to the above address.
            </div>
          </div>
        </div>
      </div>

      {/* CUT LINE */}
      <div className="flex items-center gap-4 my-10 opacity-50 break-inside-avoid">
        <div className="border-t-2 border-dashed border-gray-400 flex-1"></div>
        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Cut Here ✂</span>
        <div className="border-t-2 border-dashed border-gray-400 flex-1"></div>
      </div>

      {/* ----------------- TAX INVOICE ----------------- */}
      <div className="break-inside-avoid">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider">Tax Invoice</h1>
          <p className="text-sm text-gray-500">(Original for Recipient)</p>
        </div>

        <div className="flex justify-between border border-black mb-6 text-sm">
          {/* SELLER */}
          <div className="flex-1 p-4 border-r border-black">
            <h2 className="font-bold text-gray-500 uppercase mb-2 text-xs">Sold By:</h2>
            <div className="font-bold text-base mb-1">{storeDetails.name}</div>
            <div>{storeDetails.addressLine1}</div>
            <div>{storeDetails.addressLine2}</div>
            <div className="mt-2 font-semibold">GSTIN: {storeDetails.gstin}</div>
            <div>Email: {storeDetails.email}</div>
          </div>

          {/* BUYER */}
          <div className="flex-1 p-4 border-r border-black">
            <h2 className="font-bold text-gray-500 uppercase mb-2 text-xs">Billed To:</h2>
            <div className="font-bold text-base mb-1">{shipping.full_name || "Guest"}</div>
            <div>{shipping.address_line1}</div>
            {shipping.address_line2 && <div>{shipping.address_line2}</div>}
            <div>{shipping.city}, {shipping.state} {shipping.zip}</div>
            <div className="mt-2">Email: {order.email}</div>
          </div>

          {/* INVOICE INFO */}
          <div className="w-1/3 p-4">
            <div className="mb-2">
              <span className="font-bold text-gray-500 text-xs uppercase">Invoice No:</span>
              <div className="font-semibold text-base">{order.order_number}</div>
            </div>
            <div className="mb-2">
              <span className="font-bold text-gray-500 text-xs uppercase">Invoice Date:</span>
              <div className="font-semibold text-base">{format(new Date(order.created_at), "dd MMM yyyy")}</div>
            </div>
            <div>
              <span className="font-bold text-gray-500 text-xs uppercase">Payment Method:</span>
              <div className="font-semibold text-base uppercase">{order.payment_status}</div>
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <table className="w-full border-collapse border border-black text-sm mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 text-left w-12 text-center">#</th>
              <th className="border border-black p-2 text-left">Description</th>
              <th className="border border-black p-2 text-center w-24">HSN</th>
              <th className="border border-black p-2 text-right w-20">Qty</th>
              <th className="border border-black p-2 text-right w-28">Unit Price</th>
              <th className="border border-black p-2 text-right w-32">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item: any, idx: number) => (
              <tr key={item.id}>
                <td className="border border-black p-2 text-center">{idx + 1}</td>
                <td className="border border-black p-2">
                  <span className="font-semibold">{item.title}</span>
                  {item.variant_info && (
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.entries(item.variant_info).map(([k, v]) => (
                        <span key={k} className="mr-2 capitalize">
                          {k.replace(/_/g, " ")}: {String(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="border border-black p-2 text-center text-xs text-gray-600">6204</td> {/* Placeholder HSN for apparel */}
                <td className="border border-black p-2 text-right">{item.quantity}</td>
                <td className="border border-black p-2 text-right">₹{Number(item.unit_price).toFixed(2)}</td>
                <td className="border border-black p-2 text-right font-medium">₹{Number(item.line_total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS */}
        <div className="flex justify-end">
          <div className="w-80 text-sm">
            <div className="flex justify-between p-1.5 border-b border-gray-200">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{Number(order.subtotal).toFixed(2)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between p-1.5 border-b border-gray-200 text-green-700">
                <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                <span className="font-medium">-₹{Number(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between p-1.5 border-b border-gray-200">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">₹{Number(order.shipping_cost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-1.5 border-b border-gray-200">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">₹{Number(order.tax_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between p-3 border-b-2 border-t-2 border-black mt-2 font-bold text-base bg-gray-50">
              <span>Grand Total</span>
              <span>₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
          <p className="mb-1 font-semibold text-black">Thank you for shopping with Noir & Gold!</p>
          <p>This is a computer generated invoice and does not require a physical signature.</p>
          <p className="mt-2">Returns & Exchanges policy available at www.noirandgold.com/returns</p>
        </div>
      </div>
    </div>
  );
}
