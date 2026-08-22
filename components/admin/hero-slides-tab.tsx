"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Loader2, GripVertical, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "./confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const schema = z.object({
  heading: z.string().optional(),
  subheading: z.string().optional(),
  cta_text: z.string().optional(),
  cta_link: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

type HeroSlide = FormData & {
  id: string;
  image_url: string;
  sort_order: number;
};

function SortableItem({ slide, onEdit, onDelete }: { slide: HeroSlide, onEdit: (s: HeroSlide) => void, onDelete: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-wrap sm:flex-nowrap items-center gap-4 p-4 mb-2 bg-card border rounded-lg ${isDragging ? "shadow-md opacity-70 border-primary" : ""}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab hover:text-primary active:cursor-grabbing p-2 -ml-2 shrink-0">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="relative h-16 w-24 sm:w-32 rounded bg-muted overflow-hidden shrink-0 border">
        {slide.image_url ? (
          <Image src={slide.image_url} alt="Slide preview" fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{slide.heading || "Untitled Slide"}</h4>
        <p className="text-sm text-muted-foreground truncate">{slide.subheading || "No subheading"}</p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
        <span className={`text-xs px-2 py-1 rounded-full ${slide.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
          {slide.is_active ? "Active" : "Inactive"}
        </span>
        <Button variant="ghost" size="icon" onClick={() => onEdit(slide)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(slide.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function HeroSlidesTab() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Image upload state
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      heading: "",
      subheading: "",
      cta_text: "",
      cta_link: "",
      is_active: true,
    },
  });

  const isActive = watch("is_active");

  const fetchSlides = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("sort_order", { ascending: true });
    
    if (error) {
      toast.error("Failed to load slides");
    } else {
      setSlides(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openDialog = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setImageUrl(slide.image_url);
      reset({
        heading: slide.heading || "",
        subheading: slide.subheading || "",
        cta_text: slide.cta_text || "",
        cta_link: slide.cta_link || "",
        is_active: slide.is_active,
      });
    } else {
      setEditingSlide(null);
      setImageUrl("");
      reset({
        heading: "",
        subheading: "",
        cta_text: "",
        cta_link: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `hero_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, file);

    if (uploadError) {
      toast.error(`Upload failed: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage.from('brand-assets').getPublicUrl(fileName);
    setImageUrl(data.publicUrl);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (data: FormData) => {
    if (!imageUrl) {
      toast.error("Please upload an image for the slide");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        image_url: imageUrl,
      };

      if (editingSlide) {
        const { error } = await supabase
          .from("hero_slides")
          .update(payload)
          .eq("id", editingSlide.id);
        if (error) throw error;
        toast.success("Slide updated");
      } else {
        const { error } = await supabase
          .from("hero_slides")
          .insert({
            ...payload,
            sort_order: slides.length,
          });
        if (error) throw error;
        toast.success("Slide added");
      }
      setIsDialogOpen(false);
      fetchSlides();
    } catch (error: any) {
      toast.error(error.message || "Failed to save slide");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await supabase
        .from("hero_slides")
        .delete()
        .eq("id", deletingId);
      if (error) throw error;
      toast.success("Slide deleted");
      fetchSlides();
    } catch (error: any) {
      toast.error("Failed to delete slide");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);

    const newOrder = arrayMove(slides, oldIndex, newIndex);
    setSlides(newOrder); // Optimistic UI update

    // Persist new order
    const updates = newOrder.map((slide, index) => ({
      id: slide.id,
      sort_order: index,
      // Supabase requires all fields or just the ones being updated? 
      // upsert or individual updates. Individual updates is safer for small lists.
    }));

    try {
      for (const update of updates) {
        await supabase
          .from("hero_slides")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
      }
      toast.success("Order saved");
    } catch (e) {
      toast.error("Failed to save new order");
      fetchSlides(); // Revert on error
    }
  };

  if (isLoading) {
    return <div className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Hero Slides Management</h3>
          <p className="text-sm text-muted-foreground">Drag to reorder. The first active slide appears first on the homepage.</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Slide
        </Button>
      </div>

      <div className="mt-6">
        {slides.length === 0 ? (
          <div className="border rounded-md border-dashed p-8 text-center text-muted-foreground">
            No slides configured. Add your first hero slide to display it on the storefront.
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={slides.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {slides.map((slide) => (
                  <SortableItem 
                    key={slide.id} 
                    slide={slide} 
                    onEdit={openDialog}
                    onDelete={setDeletingId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingSlide ? "Edit Slide" : "Add Slide"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Image Uploader */}
            <div>
              <label className="text-sm font-medium mb-2 block">Background Image</label>
              {imageUrl ? (
                <div className="relative h-48 w-full rounded-md border overflow-hidden group">
                  <Image src={imageUrl} alt="Slide preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={() => setImageUrl("")}>
                      <Trash2 className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed rounded-md p-8 text-center bg-surface hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload slide image</p>
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 1920x1080 (16:9 ratio)</p>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Heading</label>
                  <Input {...register("heading")} placeholder="e.g. Summer Collection" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subheading</label>
                  <Input {...register("subheading")} placeholder="e.g. Discover the latest trends" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">CTA Button Text</label>
                  <Input {...register("cta_text")} placeholder="e.g. Shop Now" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CTA Button Link</label>
                  <Input {...register("cta_link")} placeholder="e.g. /category/summer" />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="is_active" 
                  checked={isActive} 
                  onCheckedChange={(checked) => setValue("is_active", checked as boolean)} 
                />
                <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">
                  Slide is active
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Slide
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
        title="Delete Slide"
        description="Are you sure you want to delete this slide? This action cannot be undone."
        onConfirm={handleDelete}
        isDestructive={true}
        confirmText="Delete"
      />
    </div>
  );
}
