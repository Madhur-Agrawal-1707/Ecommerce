"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface StatCardProps {
  title: string
  value: string | number
  delta?: number
  deltaType?: "increase" | "decrease"
  className?: string
}

export function StatCard({
  title,
  value,
  delta,
  deltaType,
  className,
}: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-surface p-6 shadow-sm", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <div className="mt-4 flex items-baseline gap-4">
        <div className="text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
        {delta !== undefined && (
          <div
            className={cn(
              "flex items-center text-sm font-medium",
              delta > 0 ? "text-green-600" : delta < 0 ? "text-destructive" : "text-muted-foreground"
            )}
          >
            {delta > 0 ? (
              <ArrowUpIcon className="mr-1 h-4 w-4" />
            ) : delta < 0 ? (
              <ArrowDownIcon className="mr-1 h-4 w-4" />
            ) : null}
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  )
}
