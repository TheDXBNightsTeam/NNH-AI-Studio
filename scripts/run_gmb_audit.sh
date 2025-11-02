#!/bin/bash

# ============================================
# GMB Dashboard - Run Audit Scripts via Supabase CLI
# ============================================
# هذا السكربت يشغل جميع ملفات التحقق من البيانات
# ============================================

echo "🚀 Starting GMB Dashboard Audit..."
echo ""

# الألوان للنتائج
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# التحقق من وجود Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI is not installed${NC}"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# التحقق من أنك مسجل الدخول
echo "Checking Supabase connection..."
supabase projects list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Not connected to Supabase${NC}"
    echo "Run: supabase login"
    exit 1
fi

echo -e "${GREEN}✅ Connected to Supabase${NC}"
echo ""

# الحصول على معرف المشروع (يمكنك تعديله)
PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
if [ -z "$PROJECT_REF" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_PROJECT_REF not set${NC}"
    echo "Please set it: export SUPABASE_PROJECT_REF=your-project-ref"
    echo "Or run: supabase link --project-ref your-project-ref"
    exit 1
fi

echo "📊 Project: $PROJECT_REF"
echo ""

# 1. Quick Audit
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}1. Running Quick Audit...${NC}"
echo -e "${YELLOW}========================================${NC}"
supabase db execute -f sql/gmb_quick_audit.sql --project-ref "$PROJECT_REF"
echo ""

# 2. Critical Issues Analysis
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}2. Running Critical Issues Analysis...${NC}"
echo -e "${YELLOW}========================================${NC}"
supabase db execute -f sql/gmb_critical_issues_analysis.sql --project-ref "$PROJECT_REF"
echo ""

# 3. Summary Report
echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}3. Running Summary Report...${NC}"
echo -e "${YELLOW}========================================${NC}"
supabase db execute -f sql/gmb_audit_summary_report.sql --project-ref "$PROJECT_REF"
echo ""

echo -e "${GREEN}✅ Audit completed!${NC}"
echo ""
echo "💡 Tip: To run individual queries, use:"
echo "   supabase db execute -f sql/gmb_quick_audit.sql --project-ref $PROJECT_REF"

