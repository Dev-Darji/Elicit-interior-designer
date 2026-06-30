import { getSupabase, isSupabaseConfigured } from './index'

export async function uploadImage(file: File, bucket: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    // Generate a temporary local URL for visual mockup when Supabase is not configured
    return URL.createObjectURL(file)
  }
  
  const supabase = getSupabase()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  // Helper to perform the actual upload
  const doUpload = async () => {
    return await supabase.storage
      .from(bucket)
      .upload(filePath, file)
  }

  try {
    let { error: uploadError } = await doUpload()

    if (uploadError) {
      // If bucket is not found, try to auto-create it
      const errorMsg = uploadError.message?.toLowerCase() || ""
      if (errorMsg.includes("bucket not found") || (uploadError as any).status === 404) {
        try {
          const { error: createError } = await supabase.storage.createBucket(bucket, {
            public: true,
          })
          if (!createError) {
            // Retry the upload after successful bucket creation
            const retryResult = await doUpload()
            uploadError = retryResult.error
          } else {
            throw new Error(`Storage bucket '${bucket}' not found. Please create it in your Supabase dashboard.`)
          }
        } catch (createErr) {
          throw new Error(`Storage bucket '${bucket}' not found. Please create it in your Supabase dashboard.`)
        }
      }
    }

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
  } catch (e: any) {
    console.error("Storage upload failed:", e)
    const msg = e.message || String(e)
    if (msg.toLowerCase().includes("bucket not found")) {
      throw new Error(`Bucket '${bucket}' not found. Go to Supabase Dashboard -> Storage -> New Bucket, name it '${bucket}', make it 'Public', and save.`)
    }
    throw e
  }
}

