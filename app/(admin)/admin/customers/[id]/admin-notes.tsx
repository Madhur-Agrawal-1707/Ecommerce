"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export function AdminNotes({ customerId, initialNotes }: { customerId: string; initialNotes: string }) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // NOTE: This requires the 'admin_notes' column to be added to the profiles table
      const { error } = await supabase
        .from("profiles")
        .update({ admin_notes: notes })
        .eq("id", customerId);

      if (error) {
        if (error.code === "PGRST204") {
          throw new Error("Column 'admin_notes' not found. Please apply the migration first.");
        }
        throw error;
      }
      
      toast.success("Admin notes saved successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to save admin notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Add private notes about this customer (e.g., preferences, past issues)..."
        className="min-h-[120px]"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || notes === initialNotes}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Notes
        </Button>
      </div>
    </div>
  );
}
