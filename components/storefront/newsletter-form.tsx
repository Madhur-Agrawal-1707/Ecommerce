"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ArrowRight, Loader2 } from "lucide-react"

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
})
type FormValues = z.infer<typeof schema>

export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email }: FormValues) => {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      const { error } = await supabase
        .from("subscribers")
        .insert({ email })
        .single()

      if (error) {
        if (error.code === "23505") {
          // duplicate key — already subscribed
          toast.info("You're already subscribed — thank you! ✨")
        } else {
          throw error
        }
      } else {
        toast.success("You're on the list! Watch your inbox. 🌟")
        reset()
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex w-full max-w-sm flex-col gap-2 sm:flex-row"
    >
      <div className="flex-1 min-w-0">
        <input
          {...register("email")}
          type="email"
          placeholder="your@email.com"
          aria-label="Email for newsletter"
          className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-2.5 text-sm font-semibold text-black hover:bg-gold-bright disabled:opacity-60 transition-colors shrink-0"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Subscribe <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}
