// index.js
import express from "express";
import { collectFiles } from "./fileHandler.js";
import { buildAuditPrompt, buildFixPrompt } from "./prompts.js";
import { analyzeCodeWithClaude } from "./claudeClient.js";

const app = express();
app.use(express.json());

app.post("/api/audit", async (req, res) => {
  try {
    const { component } = req.body;
    if (!component) {
      return res.status(400).json({ error: "Missing component name" });
    }

    const targetDir = `./app/${component}`;
    const files = collectFiles(targetDir);

    console.log(`🔍 Auditing ${component} (${files.length} files)`);

    const prompt = buildAuditPrompt(component, files);
    const analysis = await analyzeCodeWithClaude(prompt);

    if (!analysis.success) {
      return res.status(500).json({ error: analysis.error });
    }

    // Generate fixPrompt for AI Agent
    const fixPrompt = buildFixPrompt(files, {
      ...analysis,
      component,
    });

    return res.json({
      success: true,
      component,
      analysis: analysis.text,
      fixPrompt,
      fileCount: files.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Audit error:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => {
  console.log("🚀 Code Auditor backend running on port 3001");
});