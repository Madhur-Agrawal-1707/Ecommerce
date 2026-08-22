"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { GripVertical, Pencil, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
};

// Flatten tree to render in a 1D list with depth
type FlattenedCategory = Category & { depth: number; hasChildren: boolean };

function flattenCategories(
  categories: Category[],
  parentId: string | null = null,
  depth = 0
): FlattenedCategory[] {
  return categories
    .filter((c) => c.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .reduce((acc, category) => {
      const children = flattenCategories(categories, category.id, depth + 1);
      return [
        ...acc,
        { ...category, depth, hasChildren: children.length > 0 },
        ...children,
      ];
    }, [] as FlattenedCategory[]);
}

export function CategoryTree({
  initialCategories,
  productCounts,
}: {
  initialCategories: Category[];
  productCounts: Record<string, number>;
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const flattened = useMemo(
    () => flattenCategories(categories),
    [categories]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update sort_order based on new array index
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          sort_order: index,
        }));
        
        saveOrder(updatedItems);
        return updatedItems;
      });
    }
  };

  const saveOrder = async (updatedItems: Category[]) => {
    setIsSaving(true);
    try {
      // Bulk update is not straightforward in Supabase without a custom RPC,
      // so we do it in a loop for simplicity given small category count.
      const updates = updatedItems.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parent_id: c.parent_id,
        sort_order: c.sort_order,
      }));

      const { error } = await supabase
        .from("categories")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;
      toast.success("Order updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error("Failed to update order: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      toast.success("Category deleted");
      router.refresh();
    } catch (error: any) {
      toast.error("Failed to delete category: " + error.message);
    }
  };

  if (categories.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No categories found.</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-2">
        <SortableContext
          items={flattened.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {flattened.map((category) => (
            <SortableCategoryItem
              key={category.id}
              category={category}
              productCount={productCounts[category.id] || 0}
              onDelete={deleteCategory}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}

function SortableCategoryItem({
  category,
  productCount,
  onDelete,
}: {
  category: FlattenedCategory;
  productCount: number;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${category.depth * 2}rem`,
    zIndex: isDragging ? 1 : 0,
  };

  const isDeleteBlocked = category.hasChildren || productCount > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-card border rounded-md shadow-sm ${
        isDragging ? "opacity-50 ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          className="cursor-grab hover:bg-muted p-1 rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div>
          <span className="font-medium">{category.name}</span>
          <span className="text-sm text-muted-foreground ml-2">
            /{category.slug}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground mr-4">
          {productCount} product{productCount !== 1 ? "s" : ""}
        </span>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/categories/${category.id}`}>
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>

        {isDeleteBlocked ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              toast.error(
                `Cannot delete ${category.name}. ${
                  category.hasChildren
                    ? "It has subcategories."
                    : "It has assigned products."
                }`
              )
            }
          >
            <AlertCircle className="h-4 w-4 text-destructive" />
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  category "{category.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(category.id)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
