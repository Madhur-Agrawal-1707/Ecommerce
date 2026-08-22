"use client"

import * as React from "react"
import { useFormContext, Controller, FieldValues, Path } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4 rounded-xl border bg-surface p-6 shadow-sm", className)}>
      <div>
        <h3 className="text-lg font-medium tracking-tight text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="grid gap-6">
        {children}
      </div>
    </div>
  )
}

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>
  label: string
  placeholder?: string
  type?: string
  description?: string
  required?: boolean
  className?: string
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  description,
  required,
  className,
}: FormFieldProps<T>) {
  const { control, formState: { errors } } = useFormContext<T>()
  
  const error = errors[name]?.message as string | undefined

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={cn("space-y-2 relative", className)}>
          <div className="relative">
            <Input
              id={name}
              type={type}
              placeholder={placeholder || " "}
              required={required}
              {...field}
              value={field.value ?? ""}
              className={cn(error && "border-destructive focus-visible:border-destructive")}
            />
            <Label
              htmlFor={name}
              className={cn(error && "text-destructive peer-focus:text-destructive")}
            >
              {label} {required && <span className="text-destructive">*</span>}
            </Label>
          </div>
          {description && !error && (
            <p className="text-[0.8rem] text-muted-foreground">{description}</p>
          )}
          {error && (
            <p className="text-[0.8rem] font-medium text-destructive">{error}</p>
          )}
        </div>
      )}
    />
  )
}
