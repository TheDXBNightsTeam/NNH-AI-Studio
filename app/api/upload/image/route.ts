import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const THUMBNAIL_SIZE = 400

interface MediaMetadata {
  fileSize: number
  originalSize?: number
  fileType: string
  fileName: string
  width?: number
  height?: number
  optimized: boolean
  thumbnailGenerated: boolean
  uploadedAt: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const locationId = formData.get('locationId') as string | null
    
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const isVideo = file.type.startsWith('video/')
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const timestamp = Date.now()
    const basePath = locationId ? `${user.id}/${locationId}` : `${user.id}/general`
    const fileName = `${basePath}/${timestamp}.${ext}`
    const thumbnailName = `${basePath}/${timestamp}_thumb.webp`

    let uploadBuffer = Buffer.from(await file.arrayBuffer())
    let metadata: MediaMetadata = {
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

        // Optimize image (resize if too large, compress)
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
        // Continue with original file if Sharp fails
      }
    }

    // Upload main file
    const { data, error } = await supabase.storage
      .from('gmb-media')
      .upload(fileName, uploadBuffer, { 
        contentType: file.type, 
        upsert: false 
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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
        // Don't fail the request if DB insert fails, file is already uploaded
      }
    }

    return NextResponse.json({ 
      url: publicUrl, 
      thumbnailUrl,
      path: fileName,
      metadata,
      success: true 
    })
  } catch (e: any) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}

