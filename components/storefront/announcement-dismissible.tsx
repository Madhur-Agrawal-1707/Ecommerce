"use client"

import * as React from "react"
import { X } from "lucide-react"

/**
 * Client island — handles session-based dismiss.
 * Receives text/link as props from the parent server component.
 */
export function AnnouncementDismissible({
  text,
  link,
}: {
  text: string
  link?: string
}) {
  const [dismissed, setDismissed] = React.useState(false)

  React.useEffect(() => {
    if (sessionStorage.getItem("ng-announcement-dismissed") === "1") {
      setDismissed(true)
    }
  }, [])

  if (dismissed) return null

  const handleDismiss = () => {
    sessionStorage.setItem("ng-announcement-dismissed", "1")
    setDismissed(true)
  }

  return (
    <div className="relative flex items-center justify-center bg-gold/10 border-b border-gold/20 px-10 py-2 text-center text-xs tracking-widest text-gold uppercase">
      {link ? (
        <a href={link} className="hover:underline underline-offset-2">
          {text}
        </a>
      ) : (
        <span>{text}</span>
      )}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/60 hover:text-gold transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
