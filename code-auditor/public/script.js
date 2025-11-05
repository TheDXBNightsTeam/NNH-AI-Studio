// ==========================================
// NNH CODE AUDITOR - FRONTEND (FIXED)
// ==========================================

class AuditorApp {
  constructor() {
    // Get API base URL
    this.apiBase = this.getApiBase();
    this.currentAudit = null;

    console.log(`🔗 API Base URL: ${this.apiBase}`);
    this.init();
  }

  getApiBase() {
    // In Replit, use the current origin
    // In local dev, use localhost:3000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    return window.location.origin;
  }

  init() {
    console.log('🚀 NNH Code Auditor - Frontend Initialized');
    console.log(`🌐 Running on: ${window.location.href}`);
    this.attachEventListeners();
    this.checkHealth();
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================

  attachEventListeners() {
    // Component buttons
    document.querySelectorAll('.component-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.disabled) return;
        const component = btn.dataset.component;
        this.startAudit(component);
      });
    });

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportReport());
    }

    // New audit button
    const newAuditBtn = document.getElementById('newAuditBtn');
    if (newAuditBtn) {
      newAuditBtn.addEventListener('click', () => this.resetUI());
    }
  }

  // ==========================================
  // API CALLS
  // ==========================================

  async checkHealth() {
    try {
      console.log('🏥 Checking backend health...');
      const url = `${this.apiBase}/api/health`;
      console.log(`   URL: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Health check returned ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Backend is healthy:', data);
      this.showNotification('✅ Extension ready!', 'success');
    } catch (error) {
      console.error('❌ Health check failed:', error);
      console.error('   Make sure the server is running on port 3000');
      this.showNotification('❌ Backend not responding', 'error');
    }
  }

  async startAudit(component) {
    try {
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log(`🔍 Starting ${component} audit...`);

      const url = `${this.apiBase}/api/audit/${component}`;
      console.log(`📡 POST ${url}`);
      console.log('═══════════════════════════════════════════');

      // Show status
      this.showStatus(`Auditing ${component}...`, 'Reading files and analyzing with Claude AI');

      // Disable buttons
      this.disableButtons(true);

      // Call API
      const startTime = Date.now();

      console.log('📤 Sending request...');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      console.log(`📥 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: await response.text() };
        }

        console.error('❌ API Error:', errorData);

        throw new Error(
          errorData.error || 
          errorData.details || 
          `API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Audit failed');
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log('✅ Audit complete!');
      console.log(`⏱️ Duration: ${duration}s`);
      console.log(`💰 Cost: $${data.analysis.usage.totalCost}`);
      console.log(`📁 Files analyzed: ${data.filesAnalyzed}`);
      console.log('═══════════════════════════════════════════');
      console.log('');

      // Store results
      this.currentAudit = data;

      // Show results
      this.showResults(data);

      this.showNotification(`✅ Audit complete in ${duration}s`, 'success');

    } catch (error) {
      console.error('❌ Audit error:', error);
      console.error('   Error details:', error.message);
      console.error('   Stack:', error.stack);

      this.showError(`Audit failed: ${error.message}`);
      this.showNotification('❌ Audit failed', 'error');
    } finally {
      this.disableButtons(false);
    }
  }

  // ==========================================
  // UI UPDATES
  // ==========================================

  showStatus(title, message) {
    // Hide other sections
    document.getElementById('selectionSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');

    // Show status
    const statusSection = document.getElementById('statusSection');
    statusSection.classList.remove('hidden');

    document.getElementById('statusTitle').textContent = title;
    document.getElementById('statusMessage').textContent = message;
  }

  showResults(data) {
    // Hide status
    document.getElementById('statusSection').classList.add('hidden');

    // Show results
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.classList.remove('hidden');

    // Parse issues from analysis
    const issues = this.parseIssues(data.analysis.content);

    // Update stats
    document.getElementById('criticalCount').textContent = issues.critical || 0;
    document.getElementById('highCount').textContent = issues.high || 0;
    document.getElementById('mediumCount').textContent = issues.medium || 0;
    document.getElementById('lowCount').textContent = issues.low || 0;

    // Format and show analysis
    const formattedContent = this.formatAnalysis(data.analysis.content);
    document.getElementById('resultsContent').innerHTML = formattedContent;

    // Show metadata
    console.log('📊 Audit Metadata:');
    console.log(`   - Files analyzed: ${data.filesAnalyzed}`);
    console.log(`   - Total lines: ${data.totalLines || 'N/A'}`);
    console.log(`   - Duration: ${data.duration}`);
    console.log(`   - Input tokens: ${data.analysis.usage.inputTokens}`);
    console.log(`   - Output tokens: ${data.analysis.usage.outputTokens}`);
    console.log(`   - Cost: $${data.analysis.usage.totalCost}`);
  }

  showError(message) {
    document.getElementById('statusSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('selectionSection').classList.remove('hidden');

    const fullMessage = `❌ Error\n\n${message}\n\nCheck the console for more details (F12).`;
    alert(fullMessage);
  }

  resetUI() {
    document.getElementById('statusSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('selectionSection').classList.remove('hidden');
    this.currentAudit = null;
  }

  disableButtons(disabled) {
    document.querySelectorAll('.component-btn').forEach(btn => {
      if (!btn.hasAttribute('disabled')) {
        btn.disabled = disabled;
      }
    });
  }

  showNotification(message, type = 'info') {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    console.log(`${emoji} ${message}`);
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  parseIssues(content) {
    // Count priority markers
    const critical = (content.match(/🔴/g) || []).length;
    const high = (content.match(/🟡/g) || []).length;
    const medium = (content.match(/🟢/g) || []).length;
    const low = (content.match(/🔵/g) || []).length;

    return { critical, high, medium, low };
  }

  formatAnalysis(content) {
    // Escape HTML
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Add syntax highlighting for common patterns
    return escaped
      .replace(/^(#{1,6})\s+(.+)$/gm, '<strong style="color: var(--primary); font-size: 1.1em;">$1 $2</strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background: var(--bg-primary); padding: 2px 6px; border-radius: 4px; color: var(--info);">$1</code>')
      .replace(/(🔴|🟡|🟢|🔵)/g, '<span style="font-size: 1.2em;">$1</span>');
  }

  exportReport() {
    if (!this.currentAudit) {
      alert('No audit data to export');
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit-${this.currentAudit.component}-${timestamp}.txt`;

    const report = `
╔══════════════════════════════════════════════════════════════╗
║  NNH CODE AUDITOR - AUDIT REPORT                            ║
╚══════════════════════════════════════════════════════════════╝

Component: ${this.currentAudit.component}
Generated: ${new Date().toISOString()}
Files Analyzed: ${this.currentAudit.filesAnalyzed}
Total Lines: ${this.currentAudit.totalLines || 'N/A'}
Duration: ${this.currentAudit.duration}

API Usage:
- Input Tokens: ${this.currentAudit.analysis.usage.inputTokens}
- Output Tokens: ${this.currentAudit.analysis.usage.outputTokens}
- Total Cost: $${this.currentAudit.analysis.usage.totalCost}

═══════════════════════════════════════════════════════════════

${this.currentAudit.analysis.content}

═══════════════════════════════════════════════════════════════

Generated by NNH Code Auditor Extension
Powered by Claude Sonnet 4.5
    `.trim();

    // Create download
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`📥 Report exported: ${filename}`);
    this.showNotification('📥 Report downloaded', 'success');
  }
}

// ==========================================
// INITIALIZE APP
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║  🔍 NNH Code Auditor - Frontend         ║');
  console.log('║  Ready to audit your codebase!          ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  window.auditorApp = new AuditorApp();
});

// Handle visibility change
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && window.auditorApp) {
    console.log('👀 Tab visible again, checking backend...');
    window.auditorApp.checkHealth();
  }
});