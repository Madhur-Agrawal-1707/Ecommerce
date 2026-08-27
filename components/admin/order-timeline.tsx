"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function OrderTimeline({
  orderId,
  currentStatus,
  timeline,
}: {
  orderId: string;
  currentStatus: string;
  timeline: any[];
}) {
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAddTimelineEvent = async () => {
    if (!status) return;

    setIsSubmitting(true);
    try {
      // Get current user for created_by
      const { data: { session } } = await supabase.auth.getSession();
      
      const updatePayload: any = { fulfillment_status: status };
      if (status === "cancelled") {
        updatePayload.cancelled_at = new Date().toISOString();
      }

      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update(updatePayload)
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Insert timeline entry
      const { error: timelineError } = await supabase
        .from("order_timeline")
        .insert({
          order_id: orderId,
          status: status,
          note: note.trim() || null,
          created_by: session?.user?.id || null,
        });

      if (timelineError) throw timelineError;

      setNote("");
      toast.success("Order status updated");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 border rounded-md p-4 bg-muted/30">
          <h4 className="text-sm font-medium">Update Status</h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Add an internal note (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[40px] flex-1"
            />
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={handleAddTimelineEvent} 
              disabled={isSubmitting || (status === currentStatus && !note.trim())}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit Update
            </Button>
          </div>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {timeline.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground pt-4">No timeline events yet.</p>
          ) : (
            timeline.map((event) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm bg-card">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{event.status}</Badge>
                    <time className="text-xs text-muted-foreground font-medium">
                      {format(new Date(event.created_at), "MMM d, h:mm a")}
                    </time>
                  </div>
                  {event.note && (
                    <p className="text-sm text-foreground mt-2">{event.note}</p>
                  )}
                  {event.profiles?.full_name && (
                    <p className="text-xs text-muted-foreground mt-2 text-right">
                      — {event.profiles.full_name}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
