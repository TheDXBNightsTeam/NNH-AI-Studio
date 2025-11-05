// prompts.js
/**
 * Builds the main analysis prompt for Claude
 */
export function buildAuditPrompt(component, files) {
  const fileSummaries = files
    .map((f) => `- ${f.path} (${f.lines} lines)`)
    .join("\n");

  return `
You are an expert full-stack auditor (Next.js, TypeScript, Supabase, AI integrations).
Audit the following component: ${component}.

Identify and explain:
1. Critical issues (race conditions, data leaks, broken auth, performance).
2. High priority issues (accessibility, error handling, query optimization).
3. Best practice improvements.

Files included:
${fileSummaries}

Provide your output in this structure:
{
  "summary": "...",
  "critical": [...],
  "high": [...],
  "recommendations": [...],
  "filesAffected": [...]
}
`;
}

/**
 * Builds a Fix Prompt (for AI Agent to apply code fixes)
 */
export function buildFixPrompt(files, analysis) {
  const header = [
    "NNH AI Studio — Automated Fix Instructions",
    "",
    `Project: NNH-AI-Studio`,
    `Component: ${analysis.component || "unspecified"}`,
    "Auditor: Claude Sonnet 4.5",
    "",
    "=== Summary ===",
    analysis.summary || "No summary available",
    "",
    "=== Instructions for Agent ===",
    "You are an autonomous AI developer. Apply the fixes listed below.",
    "Preserve TypeScript types, coding style, and safety.",
    "Output only valid JSON with unified diffs, commit messages, and PR description.",
    "",
  ].join("\n");

  const perFileBlocks = files
    .map((f, i) => {
      const excerpt = f.content.split("\n").slice(0, 40).join("\n");
      return [
        `### FILE ${i + 1}: ${f.path}`,
        `Lines: ${f.lines}`,
        "",
        "Recommended Fixes:",
        "- Analyze errors, bugs, and suggestions from audit results.",
        "- Suggest exact line-level patches.",
        "",
        "File Excerpt:",
        "```",
        excerpt,
        "```",
      ].join("\n");
    })
    .join("\n-----\n");

  const footer = [
    "",
    "Expected JSON format:",
    `{
  "changes": [
    {
      "file": "path/to/file.tsx",
      "patch": "unified diff or new content",
      "commitMessage": "fix(component): short summary"
    }
  ],
  "prTitle": "Short title",
  "prDescription": "Summary of all applied fixes"
}`,
    "",
    "END OF PROMPT",
  ].join("\n");

  return [header, perFileBlocks, footer].join("\n\n");
}