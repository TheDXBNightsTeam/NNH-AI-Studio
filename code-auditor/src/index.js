// ==========================================
// NNH CODE AUDITOR - MAIN SERVER (UPDATED)
// ==========================================

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate environment
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ERROR: ANTHROPIC_API_KEY not found in .env file!');
  process.exit(1);
}

// ✅ IMPORTS
import { collectFiles } from './fileHandler.js';
import { buildAuditPrompt } from './prompts.js';
import { analyzeCodeWithClaude } from './claudeClient.js';
import { generateFixPrompt, saveFixPrompt } from './generateFixPrompt.js';

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (UI)
app.use(express.static(path.join(__dirname, '../public')));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

console.log('✅ Services initialized');
console.log('');

// ==========================================
// API ENDPOINTS
// ==========================================

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    projectPath: process.env.PROJECT_PATH || process.cwd(),
    services: {
      claude: '✅ Connected',
      fileHandler: '✅ Ready',
      prompts: '✅ Loaded'
    }
  });
});

/**
 * Audit endpoint
 */
app.post('/api/audit/:component', async (req, res) => {
  try {
    const { component } = req.params;

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log(`🔍 Starting ${component} Audit`);
    console.log('═══════════════════════════════════════════');
    console.log('');

    // Step 1: Collect files
    console.log('📁 Step 1: Collecting files...');
    const targetDir = process.env.PROJECT_PATH 
      ? path.join(process.env.PROJECT_PATH, `app/${component}`)
      : `./app/${component}`;

    const files = collectFiles(targetDir);
    console.log(`✅ Found ${files.length} files`);

    const totalLines = files.reduce((sum, f) => sum + f.lines, 0);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    console.log(`📊 Total: ${totalLines} lines, ${(totalSize / 1024).toFixed(2)} KB`);
    console.log('');

    // Step 2: Build prompt
    console.log('📝 Step 2: Building audit prompt...');
    const prompt = buildAuditPrompt(component, files);
    console.log(`✅ Prompt built (${prompt.length} characters)`);
    console.log('');

    // Step 3: Send to Claude
    console.log('🤖 Step 3: Sending to Claude...');
    console.log('⏳ This may take 30-60 seconds...');
    const startTime = Date.now();

    const analysis = await analyzeCodeWithClaude(prompt);

    if (!analysis.success) {
      throw new Error(analysis.error || 'Claude API failed');
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Analysis complete in ${duration}s`);
    console.log('');

    // Step 4: Generate Fix Prompt
    console.log('🔧 Step 4: Generating fix prompt...');
    const fixPrompt = generateFixPrompt(analysis.text, component);
    console.log(`✅ Fix prompt generated (${fixPrompt.length} characters)`);

    // Optional: Save to file
    if (process.env.SAVE_FIX_PROMPTS === 'true') {
      const outputDir = path.join(process.cwd(), 'audit-reports');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      saveFixPrompt(analysis.text, component, outputDir);
    }

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('✅ Audit Complete!');
    console.log('═══════════════════════════════════════════');
    console.log('');

    // Step 5: Return results
    res.json({
      success: true,
      component,
      analysis: {
        content: analysis.text,
        usage: {
          inputTokens: 0, // Update if you track tokens
          outputTokens: 0,
          totalCost: '0.00'
        }
      },
      fixPrompt,
      filesAnalyzed: files.length,
      totalLines,
      duration: `${duration}s`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════');
    console.error('❌ Audit Error');
    console.error('═══════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('');

    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Download fix prompt endpoint
 */
app.get('/api/fix-prompt/:component', (req, res) => {
  const { component } = req.params;
  const { report } = req.query;

  if (!report) {
    return res.status(400).json({ error: 'Missing report parameter' });
  }

  try {
    const fixPrompt = generateFixPrompt(decodeURIComponent(report), component);

    // Return as downloadable file
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="FIX_PROMPT_${component}.md"`);
    res.send(fixPrompt);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use((req, res) => {
  console.warn(`⚠️ 404 - Not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'Endpoint not found',
    requested: req.path,
    available: [
      'GET /api/health',
      'POST /api/audit/:component',
      'GET /api/fix-prompt/:component'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🚀 NNH Code Auditor Extension          ║');
  console.log('║                                          ║');
  console.log(`║  ✅ Server running on port ${PORT}         ║`);
  console.log(`║  🔗 http://localhost:${PORT}               ║`);
  console.log('║                                          ║');
  console.log('║  📚 API Endpoints:                       ║');
  console.log('║     GET  /api/health                    ║');
  console.log('║     POST /api/audit/:component          ║');
  console.log('║     GET  /api/fix-prompt/:component     ║');
  console.log('║                                          ║');
  console.log('║  🤖 Powered by Claude Sonnet 4.5        ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log('Ready to audit! Open the UI in your browser.');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('');
  console.log('👋 Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('');
  console.log('👋 Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;