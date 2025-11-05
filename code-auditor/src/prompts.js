class AuditPrompts {
  /**
   * Build comprehensive dashboard audit prompt
   */
  buildDashboardAudit(files) {
    const filesContext = files.map(f => 
      `FILE: ${f.path}\nLINES: ${f.lines}\nSIZE: ${f.size} bytes\n\`\`\`typescript\n${f.content}\n\`\`\``
    ).join('\n\n' + '='.repeat(80) + '\n\n');

    return `
@Codebase Comprehensive Audit - Dashboard Page

PROJECT: NNH AI Studio - GMB Dashboard
AUDIT SCOPE: Dashboard Page (AI Command Center)
DATE: ${new Date().toISOString()}
FILES ANALYZED: ${files.length}

═══════════════════════════════════════════════════════════════════════════════

INSTRUCTIONS:
You are a senior full-stack developer and security expert conducting a comprehensive audit.
Analyze the provided codebase thoroughly and identify ALL issues.

FOCUS AREAS:

1. FRONTEND ANALYSIS:
   - Component structure and organization
   - State management patterns (useState, useEffect, custom hooks)
   - Responsive design (mobile 375px, tablet 768px, desktop 1024px+)
   - Accessibility (WCAG 2.1 AA compliance)
     * ARIA labels on interactive elements
     * Keyboard navigation support
     * Focus indicators
     * Screen reader compatibility
   - Performance
     * Bundle size optimization
     * Lazy loading
     * Code splitting
     * Unnecessary re-renders
   - Design system compliance
     * Hardcoded colors vs CSS variables
     * Consistent spacing (Tailwind classes)
     * Typography consistency
   - TypeScript type safety
     * Any types usage
     * Missing type definitions
     * Type errors

2. BACKEND (API Routes):
   - Authentication & authorization (Supabase RLS)
   - Input validation (Zod schemas)
   - Error handling and user-friendly messages
   - Database queries
     * N+1 query problems
     * Missing indexes
     * Inefficient queries
     * Over-fetching data
   - Rate limiting implementation
   - Response time optimization
   - API endpoint security

3. DATABASE:
   - Schema design and normalization
   - Indexes (missing or inefficient)
   - RLS (Row Level Security) policies
   - Query optimization opportunities
   - Foreign key constraints
   - Data integrity

4. SECURITY:
   - XSS (Cross-Site Scripting) vulnerabilities
   - SQL injection prevention
   - CSRF (Cross-Site Request Forgery) protection
   - API key security (environment variables)
   - Rate limiting
   - Input sanitization
   - Authentication token handling

5. PERFORMANCE:
   - API response times (target: < 200ms)
   - Database query efficiency
   - Frontend bundle size (target: < 200KB gzipped)
   - Caching strategies (React Query, Supabase cache)
   - Real-time updates vs polling
   - Image optimization
   - Lazy loading implementation

═══════════════════════════════════════════════════════════════════════════════

OUTPUT FORMAT:

Please provide a structured audit report with the following sections:

## 1. Component Tree
Show the complete component hierarchy with file paths.

## 2. API Endpoints
List all API endpoints with:
- Method (GET, POST, etc.)
- Authentication required (Yes/No)
- Input parameters
- Response format
- Performance notes

## 3. Database Schema
Document tables with:
- Columns and types
- Indexes (existing and missing)
- RLS policies
- Relationships

## 4. Issues by Priority

### 🔴 CRITICAL (Fix Today)
Issues that cause bugs, security vulnerabilities, or major performance problems.

### 🟡 HIGH (Fix This Week)
Issues that impact UX, maintainability, or minor security concerns.

### 🟢 MEDIUM (Fix This Month)
Issues that are nice-to-have improvements or optimization opportunities.

### 🔵 LOW (Nice to Have)
Minor improvements or suggestions.

For EACH issue, provide:
- **Title**: Clear, concise description
- **File**: Exact file path
- **Line**: Line number(s) if applicable
- **Issue**: Detailed explanation of the problem
- **Impact**: What happens if not fixed
- **Fix**: Step-by-step instructions
- **Code Example**: Exact code to replace (before/after)
- **Effort**: Time estimate (minutes/hours)
- **Priority Justification**: Why this priority level

## 5. Code Examples for Top 10 Fixes

Provide EXACT, copy-paste ready code for the top 10 most important fixes.

Format:
\`\`\`
FILE: path/to/file.tsx
LINE: 123

BEFORE:
[exact current code]

AFTER:
[exact fixed code]
\`\`\`

═══════════════════════════════════════════════════════════════════════════════

CODEBASE:

${filesContext}

═══════════════════════════════════════════════════════════════════════════════

BEGIN COMPREHENSIVE AUDIT NOW.

Be thorough, precise, and provide actionable recommendations.
Focus on real issues that will improve code quality, security, and performance.
    `.trim();
  }

  /**
   * Build fix prompt for specific issues
   */
  buildFixPrompt(issues) {
    const issuesList = issues.map((issue, i) => 
      `
${i + 1}. ${issue.title}
   File: ${issue.file}
   Line: ${issue.line || 'N/A'}

   Current Code:
   \`\`\`
   ${issue.oldCode}
   \`\`\`

   Fixed Code:
   \`\`\`
   ${issue.newCode}
   \`\`\`

   Impact: ${issue.impact}
      `.trim()
    ).join('\n\n' + '-'.repeat(80) + '\n\n');

    return `
@Codebase Apply Fixes - Batch Operation

INSTRUCTIONS:
Apply the following ${issues.length} fixes to the codebase carefully and precisely.

RULES:
1. Locate the EXACT code specified in "Current Code"
2. Replace ONLY that code with "Fixed Code"
3. Preserve all surrounding code, comments, and formatting
4. Do NOT modify unrelated code
5. Ensure proper syntax and indentation
6. Verify imports are correct
7. Check for any side effects

FIXES TO APPLY:

${issuesList}

═══════════════════════════════════════════════════════════════════════════════

VERIFICATION CHECKLIST:
After applying each fix:
□ Code compiles without errors
□ No TypeScript errors
□ Imports are correct
□ Formatting is preserved
□ No unintended side effects
□ Related code still works

BEGIN APPLYING FIXES NOW.

Apply fixes in order, one at a time, and verify each before proceeding.
    `.trim();
  }

  /**
   * Build prompt for specific component audit
   */
  buildComponentAudit(componentName, files) {
    return this.buildDashboardAudit(files)
      .replace('Dashboard Page (AI Command Center)', `${componentName} Component`)
      .replace('Dashboard Page', componentName);
  }
}

// ✅ CORRECT EXPORT
module.exports = AuditPrompts;