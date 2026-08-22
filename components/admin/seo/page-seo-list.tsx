"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

const schema = z.object({
  page_slug: z.string().min(1, "Page slug is required"),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

type PageSeo = FormData & {
  id: string;
  og_image_url?: string | null;
};

export function PageSeoList() {
  const [pages, setPages] = useState<PageSeo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageSeo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [ogImageUrl, setOgImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      page_slug: "",
      meta_title: "",
      meta_description: "",
    },
  });

  const fetchPages = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("page_seo")
      .select("*")
      .order("page_slug", { ascending: true });
    
    if (error) {
      toast.error("Failed to load page SEO settings");
    } else {
      setPages(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openDialog = (page?: PageSeo) => {
    if (page) {
      setEditingPage(page);
      setOgImageUrl(page.og_image_url || "");
      reset({
        page_slug: page.page_slug,
        meta_title: page.meta_title || "",
        meta_description: page.meta_description || "",
      });
    } else {
      setEditingPage(null);
      setOgImageUrl("");
      reset({
        page_slug: "",
        meta_title: "",
        meta_description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `page_og_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, file);

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from('brand-assets').getPublicUrl(fileName);
    setOgImageUrl(data.publicUrl);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        og_image_url: ogImageUrl || null,
        // Ensure slug is formatted correctly
        page_slug: data.page_slug.startsWith("/") ? data.page_slug : `/${data.page_slug}`,
      };

      if (editingPage) {
        const { error } = await supabase
          .from("page_seo")
          .update(payload)
          .eq("id", editingPage.id);
        if (error) throw error;
        toast.success("Page SEO updated");
      } else {
        const { error } = await supabase
          .from("page_seo")
          .insert(payload);
        if (error) throw error;
        toast.success("Page SEO added");
      }
      setIsDialogOpen(false);
      fetchPages();
    } catch (error: any) {
      toast.error(error.message || "Failed to save page SEO");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase
        .from("page_seo")
        .delete()
        .eq("id", deletingId);
      if (error) throw error;
      toast.success("Page SEO deleted");
      fetchPages();
    } catch (error: any) {
      toast.error("Failed to delete page SEO");
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
          <h3 className="text-lg font-medium">Per-Page SEO Overrides</h3>
          <p className="text-sm text-muted-foreground">Define specific meta tags for pages like /about, /contact, etc.</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Page Override
        </Button>
      </div>

      <div className="border rounded-md mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page Slug</TableHead>
              <TableHead>Meta Title</TableHead>
              <TableHead>Meta Description</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No per-page overrides configured.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.page_slug}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{page.meta_title || "—"}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{page.meta_description || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(page)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingId(page.id)}>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingPage ? "Edit Page Override" : "Add Page Override"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Page Slug</label>
              <Input {...register("page_slug")} placeholder="e.g. /about or /contact" />
              {errors.page_slug && <p className="text-sm text-destructive">{errors.page_slug.message}</p>}
              <p className="text-xs text-muted-foreground">Use / for homepage.</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Title Override</label>
              <Input {...register("meta_title")} placeholder="Specific title for this page" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Meta Description Override</label>
              <Textarea {...register("meta_description")} rows={3} placeholder="Specific description for this page" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">OG Image Override</label>
              {ogImageUrl ? (
                <div className="relative h-40 w-72 rounded-md border overflow-hidden group">
                  <Image src={ogImageUrl} alt="OG preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="destructive" size="sm" onClick={() => setOgImageUrl("")}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-md p-6 text-center bg-surface hover:bg-muted/50 transition-colors cursor-pointer w-72"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Upload OG Image</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              )}
              {isUploading && <p className="text-sm text-muted-foreground mt-2 flex items-center"><Loader2 className="h-3 w-3 animate-spin mr-2"/> Uploading...</p>}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
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
        title="Delete Page Override"
        description="Are you sure? This page will fall back to the global SEO settings."
        onConfirm={handleDelete}
        isDestructive={true}
        confirmText="Delete"
      />
    </div>
  );
}
