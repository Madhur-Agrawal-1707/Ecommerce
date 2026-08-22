"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, UploadCloud, Copy, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MediaFile = {
  id: string;
  name: string;
  bucket: string;
  created_at: string;
  size: number;
  mime_type: string;
  url: string;
};

const BUCKETS = ["product-images", "brand-assets", "media-library"];

export function MediaGrid() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>("all");
  
  const [deletingFile, setDeletingFile] = useState<MediaFile | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadBucketRef = useRef<string>("media-library"); // Default upload bucket
  
  const supabase = createClient();

  const fetchFiles = async () => {
    setIsLoading(true);
    let allFiles: MediaFile[] = [];

    const bucketsToFetch = selectedBucket === "all" ? BUCKETS : [selectedBucket];

    for (const bucket of bucketsToFetch) {
      const { data, error } = await supabase.storage.from(bucket).list();
      
      if (error) {
        console.error(`Error fetching from ${bucket}:`, error);
        continue;
      }

      // Filter out empty placeholders
      const validFiles = data?.filter((f) => f.name !== ".emptyFolderPlaceholder") || [];

      const mapped = validFiles.map((f) => {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(f.name);
        return {
          id: f.id || "",
          name: f.name,
          bucket: bucket,
          created_at: f.created_at || new Date().toISOString(),
          size: f.metadata?.size || 0,
          mime_type: f.metadata?.mimetype || "",
          url: urlData.publicUrl,
        };
      });
      allFiles = [...allFiles, ...mapped];
    }

    // Sort by created_at desc
    allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setFiles(allFiles);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedBucket]);

  const handleUploadClick = (bucket: string) => {
    uploadBucketRef.current = bucket;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const filesArray = Array.from(e.target.files);
    
    let successCount = 0;
    const bucket = uploadBucketRef.current;

    for (const file of filesArray) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      } else {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s) to ${bucket}`);
      fetchFiles();
    }
    
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const initiateDelete = async (file: MediaFile) => {
    setDeletingFile(file);
    setIsCheckingUsage(true);
    setDeleteWarning(null);

    // Pre-check references
    try {
      const [productsRes, heroRes] = await Promise.all([
        supabase
          .from("product_images")
          .select("id, product_id", { count: "exact", head: true })
          .ilike("image_url", `%${file.name}%`),
        supabase
          .from("hero_slides")
          .select("id", { count: "exact", head: true })
          .ilike("image_url", `%${file.name}%`)
      ]);

      const inProducts = productsRes.count || 0;
      const inHero = heroRes.count || 0;

      if (inProducts > 0 || inHero > 0) {
        let warnMsg = "Warning: This image is currently in use by ";
        const parts = [];
        if (inProducts > 0) parts.push(`${inProducts} product image(s)`);
        if (inHero > 0) parts.push(`${inHero} hero slide(s)`);
        warnMsg += parts.join(" and ") + ". Deleting it will result in broken images on the storefront.";
        setDeleteWarning(warnMsg);
      }
    } catch (e) {
      console.error("Error checking usage", e);
    } finally {
      setIsCheckingUsage(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingFile) return;

    try {
      const { error } = await supabase.storage
        .from(deletingFile.bucket)
        .remove([deletingFile.name]);

      if (error) throw error;
      
      toast.success("File deleted successfully");
      setFiles((prev) => prev.filter((f) => f.id !== deletingFile.id));
    } catch (e: any) {
      toast.error(`Failed to delete file: ${e.message}`);
    } finally {
      setDeletingFile(null);
      setDeleteWarning(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedBucket} onValueChange={setSelectedBucket}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by bucket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buckets</SelectItem>
              {BUCKETS.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleUploadClick("media-library")} disabled={isUploading}>
            <UploadCloud className="mr-2 h-4 w-4" /> 
            Upload to Library
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </div>

      {isUploading && (
        <div className="p-4 bg-muted border rounded-md flex items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading files...
        </div>
      )}

      {isLoading ? (
        <div className="py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : files.length === 0 ? (
        <div className="text-center py-24 border rounded-md border-dashed text-muted-foreground">
          No files found in the selected buckets.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((file) => (
            <div key={file.id} className="group relative border rounded-md bg-card overflow-hidden flex flex-col">
              <div className="aspect-square relative bg-muted border-b">
                <Image 
                  src={file.url} 
                  alt={file.name} 
                  fill 
                  className="object-cover" 
                  unoptimized // Bypassing next/image optimization for external raw storage URLs to save quota
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" className="w-24 text-xs" onClick={() => copyUrl(file.url)}>
                    <Copy className="h-3 w-3 mr-2" /> Copy URL
                  </Button>
                  <Button size="sm" variant="secondary" className="w-24 text-xs" asChild>
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-2" /> Open
                    </a>
                  </Button>
                  <Button size="sm" variant="destructive" className="w-24 text-xs" onClick={() => initiateDelete(file)}>
                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                  </Button>
                </div>
              </div>
              <div className="p-3 text-xs">
                <p className="font-medium truncate" title={file.name}>{file.name}</p>
                <div className="flex justify-between items-center mt-1 text-muted-foreground">
                  <span>{formatBytes(file.size)}</span>
                  <span className="truncate max-w-[80px]" title={file.bucket}>{file.bucket}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingFile}
        onOpenChange={(open) => !open && setDeletingFile(null)}
        title="Delete Media File"
        description={
          isCheckingUsage 
            ? "Checking file usage..." 
            : deleteWarning || "Are you sure you want to delete this file? This action cannot be undone."
        }
        onConfirm={confirmDelete}
        isDestructive={true}
        confirmText="Delete File"
        isLoading={isCheckingUsage}
      />
    </div>
  );
}
