/**
 * عرض جميع الجداول والأعمدة في قاعدة بيانات Supabase
 * Shows all tables and columns in Supabase database
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ يرجى تعيين متغيرات البيئة')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const ALL_TABLES = [
  'gmb_accounts',
  'gmb_locations', 
  'gmb_reviews',
  'gmb_posts',
  'gmb_insights',
  'gmb_questions',
  'gmb_media',
  'gmb_attributes',
  'oauth_tokens',
  'oauth_states',
  'profiles',
  'youtube_channels',
  'youtube_drafts',
  'youtube_videos',
  'ai_generation_history',
  'user_preferences',
  'notifications'
]

async function showAllTables() {
  console.log('\n🗄️  قاعدة بيانات Supabase - جميع الجداول والأعمدة')
  console.log('=' .repeat(80))
  
  for (const tableName of ALL_TABLES) {
    console.log(`\n📊 جدول: ${tableName}`)
    console.log('-'.repeat(80))
    
    try {
      // Get one record to inspect columns
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ خطأ: ${error.message}`)
        continue
      }
      
      // Get count
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      console.log(`   📈 عدد السجلات: ${count || 0}`)
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0])
        console.log(`   📋 الأعمدة (${columns.length}):`)
        
        columns.forEach(col => {
          const value = data[0][col]
          let type = typeof value
          
          if (value === null) type = 'null'
          else if (Array.isArray(value)) type = 'array'
          else if (value instanceof Date) type = 'date'
          else if (typeof value === 'object') type = 'object'
          
          console.log(`      • ${col} (${type})`)
        })
        
        // Show sample data for first record
        if (count > 0) {
          console.log(`\n   📄 مثال على البيانات:`)
          const sample = {}
          columns.slice(0, 5).forEach(col => {
            let val = data[0][col]
            if (typeof val === 'string' && val.length > 50) {
              val = val.substring(0, 47) + '...'
            }
            sample[col] = val
          })
          console.log('     ', JSON.stringify(sample, null, 2).replace(/\n/g, '\n      '))
        }
      } else {
        console.log(`   ⚠️  الجدول فارغ - لا توجد سجلات`)
      }
      
    } catch (err) {
      console.log(`   ❌ خطأ غير متوقع: ${err.message}`)
    }
  }
  
  console.log('\n' + '='.repeat(80))
  console.log('✅ تم عرض جميع الجداول!\n')
}

showAllTables()
