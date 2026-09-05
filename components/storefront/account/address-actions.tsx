"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { deleteAddress, setDefaultAddress } from "@/lib/actions/address"
import { Trash2, Star, CheckCircle } from "lucide-react"

interface AddressActionsProps {
  id: string;
  isDefault: boolean;
}

export function AddressActions({ id, isDefault }: AddressActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSettingDefault, setIsSettingDefault] = useState(false)

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this address?")) {
      setIsDeleting(true)
      try {
        await deleteAddress(id)
      } catch (err) {
        console.error("Failed to delete", err)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleSetDefault = async () => {
    setIsSettingDefault(true)
    try {
      await setDefaultAddress(id)
    } catch (err) {
      console.error("Failed to set default", err)
    } finally {
      setIsSettingDefault(false)
    }
  }

  return (
    <div className="flex gap-2 mt-4">
      {!isDefault ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8"
          onClick={handleSetDefault}
          disabled={isSettingDefault}
        >
          {isSettingDefault ? "Setting..." : <><Star className="mr-1 h-3 w-3" /> Set Default</>}
        </Button>
      ) : (
        <Button 
          variant="secondary" 
          size="sm" 
          className="text-xs h-8 cursor-default hover:bg-secondary"
        >
          <CheckCircle className="mr-1 h-3 w-3" /> Default
        </Button>
      )}
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-xs h-8 text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "..." : <><Trash2 className="h-3 w-3" /></>}
      </Button>
    </div>
  )
}
