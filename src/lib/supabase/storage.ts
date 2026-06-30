import { getSupabase, isSupabaseConfigured } from './index'

export async function uploadImage(file: File, bucket: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    // Generate a temporary local URL for visual mockup when Supabase is not configured
    return URL.createObjectURL(file)
  }
  
  try {
    const supabase = getSupabase()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    if (!data?.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file")
    }

    return data.publicUrl
  } catch (e) {
    console.error("Storage upload failed, attempting public URL fallback:", e)
    throw e
  }
}
