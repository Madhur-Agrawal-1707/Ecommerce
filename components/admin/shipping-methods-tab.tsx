"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "./confirm-dialog";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  estimated_delivery_time: z.string().optional(),
  free_shipping_threshold: z.coerce.number().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

type ShippingMethod = FormData & {
  id: string;
  created_at: string;
};

export function ShippingMethodsTab() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any, // Bypass TS mismatch for z.coerce
    defaultValues: {
      name: "",
      price: 0,
      estimated_delivery_time: "",
      free_shipping_threshold: null,
    },
  });

  const fetchMethods = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("shipping_methods")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (error) {
      toast.error("Failed to load shipping methods");
    } else {
      setMethods(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const openDialog = (method?: ShippingMethod) => {
    if (method) {
      setEditingMethod(method);
      reset({
        name: method.name,
        price: method.price,
        estimated_delivery_time: method.estimated_delivery_time || "",
        free_shipping_threshold: method.free_shipping_threshold || null,
      });
    } else {
      setEditingMethod(null);
      reset({
        name: "",
        price: 0,
        estimated_delivery_time: "",
        free_shipping_threshold: null,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        free_shipping_threshold: data.free_shipping_threshold || null,
      };

      if (editingMethod) {
        const { error } = await supabase
          .from("shipping_methods")
          .update(payload)
          .eq("id", editingMethod.id);
        if (error) throw error;
        toast.success("Shipping method updated");
      } else {
        const { error } = await supabase
          .from("shipping_methods")
          .insert(payload);
        if (error) throw error;
        toast.success("Shipping method added");
      }
      setIsDialogOpen(false);
      fetchMethods();
    } catch (error: any) {
      toast.error(error.message || "Failed to save shipping method");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase
        .from("shipping_methods")
        .delete()
        .eq("id", deletingId);
      if (error) throw error;
      toast.success("Shipping method deleted");
      fetchMethods();
    } catch (error: any) {
      toast.error("Failed to delete shipping method");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Shipping Methods</h3>
          <p className="text-sm text-muted-foreground">Manage the shipping zones and rates available at checkout.</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Method
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Free Shipping After</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {methods.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No shipping methods configured.
                </TableCell>
              </TableRow>
            ) : (
              methods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">{method.name}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(method.price)}
                  </TableCell>
                  <TableCell>{method.estimated_delivery_time || "—"}</TableCell>
                  <TableCell>
                    {method.free_shipping_threshold 
                      ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(method.free_shipping_threshold)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(method)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingId(method.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMethod ? "Edit Shipping Method" : "Add Shipping Method"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input {...register("name")} placeholder="e.g. Standard Shipping" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price (₹)</label>
                <Input type="number" step="0.01" {...register("price")} placeholder="0.00" />
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Free Shipping Threshold (₹)</label>
                <Input type="number" step="1" {...register("free_shipping_threshold")} placeholder="Leave blank for none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Delivery Time</label>
              <Input {...register("estimated_delivery_time")} placeholder="e.g. 3-5 business days" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Shipping Method"
        description="Are you sure you want to delete this shipping method? Customers will no longer be able to select it during checkout."
        onConfirm={handleDelete}
        isDestructive={true}
        confirmText="Delete"
      />
    </div>
  );
}
