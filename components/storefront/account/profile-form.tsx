"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/lib/actions/profile"

interface ProfileFormProps {
  initialData: {
    full_name: string;
    email: string;
    phone: string;
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: initialData.full_name || "",
      email: initialData.email || "", // Email will be readonly for now
      phone: initialData.phone || "",
      password: "",
      confirmPassword: ""
    }
  })

  const onSubmit = async (data: any) => {
    setMessage(null)
    
    if (data.password && data.password !== data.confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match" })
      return
    }

    setIsLoading(true)
    
    try {
      await updateProfile({
        full_name: data.full_name,
        phone: data.phone,
        password: data.password || undefined
      })
      setMessage({ type: 'success', text: "Profile updated successfully" })
      router.refresh()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || "Something went wrong" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input 
            {...register("full_name", { required: "Full name is required" })} 
            placeholder="John Doe" 
          />
          {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message as string}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <Input 
            value={initialData.email} 
            disabled 
            className="bg-muted"
            title="Email cannot be changed here"
          />
          <p className="text-xs text-muted-foreground">Contact support to change your email.</p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Number</label>
          <Input 
            {...register("phone")} 
            placeholder="+1 (555) 000-0000" 
          />
        </div>
      </div>

      <div className="border-t border-border pt-6 mt-6">
        <h3 className="text-lg font-medium mb-4">Change Password</h3>
        <p className="text-sm text-muted-foreground mb-6">Leave blank if you don't want to change your password.</p>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <Input 
              type="password"
              {...register("password", { 
                minLength: { value: 6, message: "Password must be at least 6 characters" } 
              })} 
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message as string}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <Input 
              type="password"
              {...register("confirmPassword")} 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
