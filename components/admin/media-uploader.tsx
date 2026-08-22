"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { UploadCloud, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export function MediaUploader({
  images,
  setImages,
}: {
  images: any[]
  setImages: (images: any[]) => void
}) {
  const [isUploading, setIsUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    setIsUploading(true)
    const files = Array.from(e.target.files)
    
    // Check max limit
    if (images.length + files.length > 10) {
      toast.error("Maximum 10 images allowed.")
      setIsUploading(false)
      return
    }

    const newImages = [...images]

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) {
        toast.error(`Error uploading ${file.name}: ${uploadError.message}`)
        continue
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
      
      newImages.push({
        image_url: data.publicUrl,
        alt_text: "",
        image_type: "front",
        sort_order: newImages.length
      })
    }

    setImages(newImages)
    setIsUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  return (
    <div className="space-y-4">
      <div 
        className="border-2 border-dashed border-border rounded-md p-8 text-center bg-surface hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium">Click to upload images</p>
        <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WEBP (Max 10)</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          accept="image/*" 
          className="hidden" 
        />
      </div>

      {isUploading && (
        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-md overflow-hidden border">
              <div className="aspect-square relative bg-muted">
                <Image src={img.image_url} alt="Product image" fill className="object-cover" />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
