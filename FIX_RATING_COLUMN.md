# إصلاح عمود Rating في gmb_locations

## المشكلة
```
"code": "42703",
"message": "column gmb_locations.rating does not exist"
```

## الحل

### الخطوة 1: تشغيل Migration
افتح Supabase SQL Editor وشغّل:

```sql
-- Add rating column to gmb_locations table
ALTER TABLE public.gmb_locations 
ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1);

-- Add index for rating queries
CREATE INDEX IF NOT EXISTS idx_gmb_locations_rating ON public.gmb_locations(rating);

-- Add comment
COMMENT ON COLUMN public.gmb_locations.rating IS 'Average rating for the location (0.0 to 5.0)';
```

### الخطوة 2: تحديث Rating من المراجعات الموجودة (اختياري)
```sql
-- Update rating based on existing reviews
UPDATE public.gmb_locations loc
SET rating = (
  SELECT AVG(rating)
  FROM public.gmb_reviews rev
  WHERE rev.location_id = loc.id
  AND rev.rating IS NOT NULL
)
WHERE EXISTS (
  SELECT 1 
  FROM public.gmb_reviews rev 
  WHERE rev.location_id = loc.id
);
```

### الخطوة 3: اختبار
1. افتح GMB Dashboard
2. اضغط "Sync Data"
3. تحقق من أن الخطأ اختفى

## التحقق من نجاح العملية
```sql
-- Check if column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gmb_locations' 
AND column_name = 'rating';
```

يجب أن ترى:
```
column_name | data_type
rating      | numeric
```

