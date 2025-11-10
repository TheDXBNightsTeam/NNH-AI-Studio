// ==========================================
// IMPROVED FIX PROMPT GENERATOR
// ==========================================

/**
 * Parse Claude's audit report and extract actionable fixes
 */
export function parseAuditReport(reportText) {
  const fixes = [];
  const lines = reportText.split('\n');

  let currentSection = null;
  let currentIssue = null;
  let collectingCode = false;
  let codeBlock = [];
  let codeType = null; // 'before' or 'after'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect priority sections
    if (line.includes('🔴 CRITICAL') || line.includes('### 🔴')) {
      currentSection = 'critical';
    } else if (line.includes('🟡 HIGH') || line.includes('### 🟡')) {
      currentSection = 'high';
    } else if (line.includes('🟢 MEDIUM') || line.includes('### 🟢')) {
      currentSection = 'medium';
    } else if (line.includes('🔵 LOW') || line.includes('### 🔵')) {
      currentSection = 'low';
    }

    // Detect issue title
    if (line.match(/^\d+\.\s+\*\*.*\*\*/) || line.match(/^#{2,4}\s+\d+\./)) {
      // Save previous issue if exists
      if (currentIssue) {
        fixes.push(currentIssue);
      }

      // Start new issue
      currentIssue = {
        priority: currentSection || 'medium',
        title: line.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '').replace(/^#{2,4}\s+/, '').trim(),
        file: null,
        line: null,
        description: '',
        before: null,
        after: null
      };
    }

    // Extract file path
    if (currentIssue && (line.includes('**File:**') || line.includes('File:'))) {
      currentIssue.file = line
        .replace(/\*\*File:\*\*/, '')
        .replace(/File:/, '')
        .replace(/`/g, '')
        .trim();
    }

    // Extract line number
    if (currentIssue && (line.includes('**Line:**') || line.includes('Line:'))) {
      const match = line.match(/\d+/);
      if (match) {
        currentIssue.line = parseInt(match[0]);
      }
    }

    // Detect code blocks
    if (line.includes('```')) {
      if (!collectingCode) {
        // Start collecting
        collectingCode = true;
        codeBlock = [];

        // Determine type from context
        const prevLines = lines.slice(Math.max(0, i - 3), i).join(' ').toLowerCase();
        if (prevLines.includes('before') || prevLines.includes('current')) {
          codeType = 'before';
        } else if (prevLines.includes('after') || prevLines.includes('fixed')) {
          codeType = 'after';
        }
      } else {
        // End collecting
        collectingCode = false;

        if (currentIssue && codeBlock.length > 0) {
          const code = codeBlock.join('\n');
          if (codeType === 'before') {
            currentIssue.before = code;
          } else if (codeType === 'after') {
            currentIssue.after = code;
          }
        }

        codeBlock = [];
        codeType = null;
      }
      continue;
    }

    if (collectingCode) {
      codeBlock.push(line);
    }

    // Collect description
    if (currentIssue && !collectingCode && line.trim() && 
        !line.includes('**File:**') && 
        !line.includes('**Line:**') &&
        !line.includes('###') &&
        !line.includes('```')) {
      currentIssue.description += line + '\n';
    }
  }

  // Save last issue
  if (currentIssue) {
    fixes.push(currentIssue);
  }

  return fixes;
}

/**
 * Generate structured fix prompt for AI agents
 */
export function generateFixPrompt(reportText, componentName) {
  const fixes = parseAuditReport(reportText);

  // Filter fixes that have actionable code
  const actionableFixes = fixes.filter(f => f.before && f.after && f.file);

  if (actionableFixes.length === 0) {
    return generateGenericFixPrompt(reportText, componentName);
  }

  const prompt = `
# 🔧 Code Fix Instructions for AI Agent

## Project Context
- **Project**: NNH AI Studio - GMB Dashboard
- **Component**: ${componentName}
- **Framework**: Next.js 14, TypeScript, Supabase, TailwindCSS
- **Date**: ${new Date().toISOString()}

## Your Mission
You are an expert full-stack developer. Apply the following ${actionableFixes.length} fixes to the codebase.

## Rules
1. ✅ Apply ONLY the changes specified below
2. ✅ Preserve all surrounding code exactly as is
3. ✅ Maintain TypeScript types and imports
4. ✅ Follow the existing code style
5. ✅ Do NOT modify unrelated code
6. ✅ Test each change mentally for side effects

## Fixes to Apply

${actionableFixes.map((fix, i) => `
### Fix ${i + 1}: ${fix.title}

**Priority**: ${getPriorityEmoji(fix.priority)} ${fix.priority.toUpperCase()}
**File**: \`${fix.file}\`
${fix.line ? `**Line**: ${fix.line}` : ''}

**Issue Description**:
${fix.description.trim()}

**Current Code** (❌ REPLACE THIS):
\`\`\`typescript
${fix.before.trim()}
\`\`\`

**Fixed Code** (✅ WITH THIS):
\`\`\`typescript
${fix.after.trim()}
\`\`\`

**Verification Checklist** (after applying):
- [ ] Code compiles without errors
- [ ] TypeScript types are correct
- [ ] No new ESLint warnings
- [ ] Imports are preserved
- [ ] Indentation matches surrounding code

---
`).join('\n')}

## Summary

Total fixes: **${actionableFixes.length}**
- 🔴 Critical: ${actionableFixes.filter(f => f.priority === 'critical').length}
- 🟡 High: ${actionableFixes.filter(f => f.priority === 'high').length}
- 🟢 Medium: ${actionableFixes.filter(f => f.priority === 'medium').length}
- 🔵 Low: ${actionableFixes.filter(f => f.priority === 'low').length}

## Files Affected

${[...new Set(actionableFixes.map(f => f.file))].map(file => `- \`${file}\``).join('\n')}

## Post-Fix Validation

After applying ALL fixes, run:

\`\`\`bash
# Check TypeScript
npm run type-check

# Check linting
npm run lint

# Run tests
npm run test

# Build
npm run build
\`\`\`

If any errors occur, review the specific fix that caused it and adjust.

---

**Generated by**: NNH Code Auditor Extension
**Powered by**: Claude Sonnet 4.5
  `.trim();

  return prompt;
}

/**
 * Generate generic fix prompt when specific fixes aren't available
 */
function generateGenericFixPrompt(reportText, componentName) {
  return `
# 🔧 Code Fix Instructions for AI Agent

## Project Context
- **Project**: NNH AI Studio - GMB Dashboard  
- **Component**: ${componentName}
- **Framework**: Next.js 14, TypeScript, Supabase, TailwindCSS

## Your Mission
Review the audit report below and apply appropriate fixes to the codebase.

## Audit Report

${reportText}

## Instructions

1. **Analyze** the issues identified in the report
2. **Prioritize** fixes: Critical → High → Medium → Low
3. **Apply** fixes one at a time
4. **Test** after each fix to ensure nothing breaks
5. **Commit** with descriptive messages

## Expected Output Format

For each fix, provide:

\`\`\`json
{
  "file": "path/to/file.tsx",
  "description": "What you fixed",
  "changes": {
    "before": "old code snippet",
    "after": "new code snippet"
  },
  "reasoning": "Why this fix is needed",
  "testing": "How to verify the fix works"
}
\`\`\`

---

**Generated by**: NNH Code Auditor Extension
**Powered by**: Claude Sonnet 4.5
  `.trim();
}

/**
 * Get priority emoji
 */
function getPriorityEmoji(priority) {
  const emojis = {
    critical: '🔴',
    high: '🟡',
    medium: '🟢',
    low: '🔵'
  };
  return emojis[priority] || '⚪';
}

/**
 * Save fix prompt to file
 */
export function saveFixPrompt(auditReport, componentName, outputPath) {
  const fs = require('fs');
  const path = require('path');

  const fixPrompt = generateFixPrompt(auditReport, componentName);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `FIX_PROMPT_${componentName}_${timestamp}.md`;
  const fullPath = path.join(outputPath, filename);

  fs.writeFileSync(fullPath, fixPrompt, 'utf-8');

  console.log(`\n✅ Fix prompt saved: ${fullPath}`);
  console.log(`📋 Copy and paste this file to your AI coding assistant\n`);

  return fullPath;
}