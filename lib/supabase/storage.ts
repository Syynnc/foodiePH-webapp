import { createClient } from "./client";

export type UploadBucket = "restaurant-images" | "menu-images" | "driver-docs";

/**
 * Upload a file to Supabase Storage and return its public URL.
 * The file is stored at `{bucket}/{folder}/{timestamp}-{sanitisedName}`.
 *
 * Requirements: the bucket must exist in your Supabase project with public
 * access enabled (or use signed URLs for private buckets).
 */
export async function uploadImage(
  file: File,
  bucket: UploadBucket,
  folder = "uploads"
): Promise<string> {
  const supabase = createClient();

  // Sanitise filename: keep extension, replace everything else with underscores
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeName = file.name
    .replace(/\.[^.]+$/, "")              // drop extension
    .replace(/[^a-zA-Z0-9_-]/g, "_")     // sanitise characters
    .slice(0, 60);                         // cap length
  const path = `${folder}/${Date.now()}-${safeName}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from storage given its public URL.
 * Safe to call even if the URL isn't from Supabase Storage — it will just
 * return without error.
 */
export async function deleteImage(publicUrl: string, bucket: UploadBucket): Promise<void> {
  const supabase = createClient();
  // Extract path from public URL: everything after /storage/v1/object/public/{bucket}/
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(bucket).remove([path]);
}
