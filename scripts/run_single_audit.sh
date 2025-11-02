#!/bin/bash

# ============================================
# Run a single SQL file via Supabase CLI
# ============================================
# Usage: ./scripts/run_single_audit.sh <sql_file>
# Example: ./scripts/run_single_audit.sh sql/gmb_quick_audit.sql
# ============================================

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a SQL file path"
    echo "Usage: $0 <sql_file>"
    echo "Example: $0 sql/gmb_quick_audit.sql"
    exit 1
fi

SQL_FILE="$1"

# التحقق من وجود الملف
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: File not found: $SQL_FILE"
    exit 1
fi

# الحصول على معرف المشروع
PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
if [ -z "$PROJECT_REF" ]; then
    echo "⚠️  SUPABASE_PROJECT_REF not set, trying to detect..."
    # محاولة الكشف التلقائي من supabase config
    if [ -f ".supabase/config.toml" ]; then
        PROJECT_REF=$(grep -A 5 "project_id" .supabase/config.toml 2>/dev/null | head -1 | cut -d'"' -f2)
    fi
    
    if [ -z "$PROJECT_REF" ]; then
        echo "Please set: export SUPABASE_PROJECT_REF=your-project-ref"
        exit 1
    fi
fi

echo "🚀 Running: $SQL_FILE"
echo "📊 Project: $PROJECT_REF"
echo ""

supabase db execute -f "$SQL_FILE" --project-ref "$PROJECT_REF"

