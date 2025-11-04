/**
 * إصلاح الأعمدة المفقودة في جدول gmb_locations
 * Fix Missing Columns in gmb_locations Table
 * 
 * Usage: NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/fix_gmb_locations_columns.js
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ يرجى تعيين متغيرات البيئة')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function executeSQL(sql, description) {
  console.log(`\n🔄 ${description}...`)
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error(`❌ خطأ: ${error.message}`)
      return false
    }
    
    console.log(`✅ تم بنجاح`)
    if (data) console.log(data)
    return true
  } catch (err) {
    console.error(`❌ خطأ غير متوقع: ${err.message}`)
    return false
  }
}

async function fixMissingColumns() {
  console.log('\n🔧 بدء إصلاح الأعمدة المفقودة في gmb_locations...')
  console.log('=' .repeat(60))
  
  // ملاحظة: Supabase لا يسمح بـ exec_sql مباشرة
  // يجب تنفيذ SQL في Supabase SQL Editor
  
  console.log('\n⚠️  ملاحظة مهمة:')
  console.log('لا يمكن تنفيذ ALTER TABLE عبر Supabase JS Client')
  console.log('يجب تنفيذ السكريبت في Supabase SQL Editor')
  console.log('')
  console.log('📋 الخطوات:')
  console.log('1. افتح: https://supabase.com/dashboard')
  console.log('2. اذهب إلى: SQL Editor')
  console.log('3. انسخ محتوى: sql/fix_gmb_locations_missing_columns.sql')
  console.log('4. الصق في SQL Editor واضغط Run')
  console.log('')
  
  // لكن يمكننا التحقق من الحالة الحالية
  console.log('🔍 التحقق من الأعمدة الحالية...')
  console.log('-'.repeat(60))
  
  const { data: locations, error } = await supabase
    .from('gmb_locations')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ خطأ في قراءة الجدول:', error.message)
    return
  }
  
  if (locations && locations.length > 0) {
    const columns = Object.keys(locations[0])
    const requiredColumns = ['review_count', 'response_rate', 'is_syncing', 'ai_insights']
    
    console.log('\n📊 الأعمدة الموجودة حالياً:')
    columns.forEach(col => {
      const isRequired = requiredColumns.includes(col)
      const status = isRequired ? '✅' : '  '
      console.log(`${status} ${col}`)
    })
    
    console.log('\n🔍 الأعمدة المطلوبة:')
    requiredColumns.forEach(col => {
      const exists = columns.includes(col)
      const status = exists ? '✅ موجود' : '❌ مفقود'
      console.log(`${status} - ${col}`)
    })
    
    const missingColumns = requiredColumns.filter(col => !columns.includes(col))
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️  الأعمدة المفقودة:', missingColumns.join(', '))
      console.log('\n📝 يجب تنفيذ السكريبت في Supabase SQL Editor:')
      console.log('   sql/fix_gmb_locations_missing_columns.sql')
    } else {
      console.log('\n✅ جميع الأعمدة المطلوبة موجودة!')
      
      // حساب الإحصائيات
      const { data: stats, error: statsError } = await supabase
        .from('gmb_locations')
        .select('review_count, response_rate, is_syncing, ai_insights')
      
      if (!statsError && stats) {
        console.log('\n📊 الإحصائيات:')
        console.log(`   إجمالي المواقع: ${stats.length}`)
        console.log(`   إجمالي التقييمات: ${stats.reduce((sum, l) => sum + (l.review_count || 0), 0)}`)
        console.log(`   متوسط معدل الرد: ${(stats.reduce((sum, l) => sum + (l.response_rate || 0), 0) / stats.length).toFixed(2)}%`)
        console.log(`   المواقع قيد المزامنة: ${stats.filter(l => l.is_syncing).length}`)
        console.log(`   المواقع مع رؤى AI: ${stats.filter(l => l.ai_insights).length}`)
      }
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ انتهى الفحص!')
}

fixMissingColumns()
