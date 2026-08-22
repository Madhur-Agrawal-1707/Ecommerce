// Pure server component — no "use client" directive here.
// The dismiss interaction is handled by the separate client island.
import { createClient } from "@/lib/supabase/server"
import { AnnouncementDismissible } from "./announcement-dismissible"

async function fetchAnnouncement(): Promise<{
  text: string
  link?: string
  active: boolean
} | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("announcement_bar_active, announcement_bar_text, announcement_bar_link")
      .single()

    if (error || !data) return null

    return {
      active: data.announcement_bar_active ?? false,
      text: data.announcement_bar_text ?? "",
      link: data.announcement_bar_link ?? undefined,
    }
  } catch {
    // Table doesn't exist yet — static fallback
    return {
      active: true,
      text: "Free shipping on orders above ₹1,999 • Handcrafted in India",
    }
  }
}

export async function AnnouncementBar() {
  const data = await fetchAnnouncement()
  if (!data || !data.active || !data.text) return null

  return <AnnouncementDismissible text={data.text} link={data.link} />
}
