"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { createAddress, updateAddress, type AddressFormValues } from "@/lib/actions/address"

interface AddressFormProps {
  initialData?: AddressFormValues & { id?: string };
}

export function AddressForm({ initialData }: AddressFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddressFormValues>({
    defaultValues: {
      full_name: initialData?.full_name || "",
      address_line1: initialData?.address_line1 || "",
      address_line2: initialData?.address_line2 || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zip: initialData?.zip || "",
      country: initialData?.country || "India",
      phone: initialData?.phone || "",
      is_default: initialData?.is_default || false,
    }
  })

  const isDefault = watch("is_default")

  const onSubmit = async (data: AddressFormValues) => {
    setError(null)
    setIsLoading(true)
    
    try {
      if (initialData?.id) {
        await updateAddress(initialData.id, data)
      } else {
        await createAddress(data)
      }
      router.push("/account/addresses")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name</label>
        <Input 
          {...register("full_name", { required: "Full name is required" })} 
          placeholder="John Doe" 
        />
        {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Phone Number</label>
        <Input 
          {...register("phone")} 
          placeholder="+91 9876543210" 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Address Line 1</label>
        <Input 
          {...register("address_line1", { required: "Address is required" })} 
          placeholder="123 Main St, Apartment, Studio, or Floor" 
        />
        {errors.address_line1 && <p className="text-xs text-red-500">{errors.address_line1.message}</p>}
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Address Line 2 (Optional)</label>
        <Input 
          {...register("address_line2")} 
          placeholder="Landmark, Suite, Unit, etc." 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">City / District</label>
          <Input 
            {...register("city", { required: "City is required" })} 
            placeholder="Mumbai" 
          />
          {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">State / Province</label>
          <Input 
            {...register("state", { required: "State is required" })} 
            placeholder="Maharashtra" 
          />
          {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">ZIP / Postal Code</label>
          <Input 
            {...register("zip", { required: "ZIP code is required" })} 
            placeholder="400001" 
          />
          {errors.zip && <p className="text-xs text-red-500">{errors.zip.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Input 
            {...register("country", { required: "Country is required" })} 
            placeholder="India" 
          />
          {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="is_default" 
          checked={isDefault}
          onCheckedChange={(checked) => setValue("is_default", checked as boolean)}
        />
        <label
          htmlFor="is_default"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Set as default address
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-border">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push("/account/addresses")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Address"}
        </Button>
      </div>
    </form>
  )
}
