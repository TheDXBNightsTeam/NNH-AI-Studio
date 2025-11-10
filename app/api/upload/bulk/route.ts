import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_FILES = 20 // Maximum 20 files per bulk upload
const THUMBNAIL_SIZE = 400

interface UploadResult {
  fileName: string
  success: boolean
  url?: string
  thumbnailUrl?: string
  error?: string
  metadata?: any
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files: File[] = []
    const locationId = formData.get('locationId') as string | null

    // Collect all files from formData
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ 
        error: `Too many files. Maximum ${MAX_FILES} files allowed per upload` 
      }, { status: 400 })
    }

    const results: UploadResult[] = []
    let uploaded = 0
    let failed = 0

    for (const file of files) {
      try {
        // Validate file size
        if (file.size > MAX_SIZE) {
          results.push({
            fileName: file.name,
            success: false,
            error: 'File too large (max 10MB)'
          })
          failed++
          continue
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
        if (!allowedTypes.includes(file.type)) {
          results.push({
            fileName: file.name,
            success: false,
            error: 'Invalid file type'
          })
          failed++
          continue
        }

        const isVideo = file.type.startsWith('video/')
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const timestamp = Date.now() + Math.random() // Add random to avoid collisions
        const basePath = locationId ? `${user.id}/${locationId}` : `${user.id}/general`
        const fileName = `${basePath}/${timestamp}.${ext}`
        const thumbnailName = `${basePath}/${timestamp}_thumb.webp`

        let uploadBuffer = Buffer.from(await file.arrayBuffer())
        let metadata: any = {
          fileSize: file.size,
          originalSize: file.size,
          fileType: file.type,
          fileName: file.name,
          optimized: false,
          thumbnailGenerated: false,
          uploadedAt: new Date().toISOString()
        }

        let thumbnailUrl: string | null = null

        // Optimize images with Sharp
        if (!isVideo) {
          try {
            const image = sharp(uploadBuffer)
            const imageMetadata = await image.metadata()
            
            metadata.width = imageMetadata.width
            metadata.height = imageMetadata.height

            // Optimize image
            const maxDimension = 2048
            if ((imageMetadata.width || 0) > maxDimension || (imageMetadata.height || 0) > maxDimension) {
              const optimizedBuffer = await image
                .resize(maxDimension, maxDimension, {
                  fit: 'inside',
                  withoutEnlargement: true
                })
                .jpeg({ quality: 85 })
                .toBuffer()
              uploadBuffer = Buffer.from(optimizedBuffer)
              metadata.optimized = true
              metadata.fileSize = uploadBuffer.length
            }

            // Generate thumbnail
            const thumbnailBuffer = await sharp(uploadBuffer)
              .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
                fit: 'cover',
                position: 'center'
              })
              .webp({ quality: 80 })
              .toBuffer()

            // Upload thumbnail
            const { error: thumbError } = await supabase.storage
              .from('gmb-media')
              .upload(thumbnailName, thumbnailBuffer, {
                contentType: 'image/webp',
                upsert: false
              })

            if (!thumbError) {
              const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
                .from('gmb-media')
                .getPublicUrl(thumbnailName)
              thumbnailUrl = thumbPublicUrl
              metadata.thumbnailGenerated = true
            }
          } catch (sharpError) {
            console.error('Sharp processing error:', sharpError)
          }
        }

        // Upload main file
        const { error: uploadError } = await supabase.storage
          .from('gmb-media')
          .upload(fileName, uploadBuffer, { 
            contentType: file.type, 
            upsert: false 
          })

        if (uploadError) {
          results.push({
            fileName: file.name,
            success: false,
            error: uploadError.message
          })
          failed++
          continue
        }

        const { data: { publicUrl } } = supabase.storage
          .from('gmb-media')
          .getPublicUrl(fileName)

        // Save to database if locationId provided
        if (locationId) {
          const mediaType = isVideo ? 'VIDEO' : 'PHOTO'
          
          const { error: dbError } = await supabase
            .from('gmb_media')
            .insert({
              user_id: user.id,
              location_id: locationId,
              url: publicUrl,
              type: mediaType,
              thumbnail_url: thumbnailUrl || (isVideo ? null : publicUrl),
              metadata: metadata,
              created_at: new Date().toISOString()
            })

          if (dbError) {
            console.error('Database insert error:', dbError)
          }
        }

        results.push({
          fileName: file.name,
          success: true,
          url: publicUrl,
          thumbnailUrl: thumbnailUrl || undefined,
          metadata
        })
        uploaded++

      } catch (error: any) {
        console.error(`Error uploading ${file.name}:`, error)
        results.push({
          fileName: file.name,
          success: false,
          error: error?.message || 'Upload failed'
        })
        failed++
      }
    }

    return NextResponse.json({ 
      success: uploaded > 0,
      uploaded,
      failed,
      total: files.length,
      results
    })

  } catch (e: any) {
    console.error('Bulk upload error:', e)
    return NextResponse.json({ 
      error: e?.message || 'Bulk upload failed' 
    }, { status: 500 })
  }
}
