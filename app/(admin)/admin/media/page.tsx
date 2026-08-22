export const metadata = {
  title: "Media Library | Admin Dashboard",
};

import { MediaGrid } from "@/components/admin/media/media-grid";

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground">Manage all uploaded images across your store. View, upload, and safely delete assets.</p>
      </div>

      <MediaGrid />
    </div>
  );
}
