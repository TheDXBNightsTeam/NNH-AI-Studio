// ==========================================
// NNH CODE AUDITOR - FRONTEND
// ==========================================

class AuditorApp {
  constructor() {
    this.apiBase = window.location.origin;
    this.currentAudit = null;
    this.init();
  }

  init() {
    console.log('🚀 Auditor App initialized');
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
        const component = btn.dataset.component;
        this.startAudit(component);
      });
    });

    // Apply fixes button
    document.getElementById('applyFixesBtn')?.addEventListener('click', () => {
      this.applyFixes();
    });

    // Export button
    document.getElementById('exportBtn')?.addEventListener('click', () => {
      this.exportReport();
    });

    // New audit button
    document.getElementById('newAuditBtn')?.addEventListener('click', () => {
      this.resetUI();
    });
  }

  // ==========================================
  // API CALLS
  // ==========================================

  async checkHealth() {
    try {
      const response = await fetch(`${this.apiBase}/api/health`);
      const data = await response.json();
      console.log('✅ Health check:', data);
    } catch (error) {
      console.error('❌ Health check failed:', error);
      this.showError('Backend is not responding. Please check the server.');
    }
  }

  async startAudit(component) {
    try {
      // Show status
      this.showStatus(`Auditing ${component}...`, 'Analyzing code with Claude');

      // Call API
      const response = await fetch(`${this.apiBase}/api/audit/${component}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Audit failed');
      }

      // Store results
      this.currentAudit = data;

      // Show results
      this.showResults(data);

      console.log('✅ Audit complete:', data);

    } catch (error) {
      console.error('❌ Audit error:', error);
      this.showError(`Audit failed: ${error.message}`);
    }
  }

  async applyFixes() {
    if (!this.currentAudit || !this.currentAudit.fixes) {
      this.showError('No fixes available');
      return;
    }

    if (!confirm(`Apply ${this.currentAudit.fixes.length} fixes to your code?`)) {
      return;
    }

    try {
      this.showStatus('Applying fixes...', 'Modifying files');

      const response = await fetch(`${this.apiBase}/api/fix/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fixes: this.currentAudit.fixes
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to apply fixes');
      }

      alert(`✅ Applied ${data.applied} fixes successfully!\n❌ ${data.failed} fixes failed.`);

      // Refresh audit
      this.startAudit(this.currentAudit.component);

    } catch (error) {
      console.error('❌ Apply fixes error:', error);
      this.showError(`Failed to apply fixes: ${error.message}`);
    }
  }

  // ==========================================
  // UI UPDATES
  // ==========================================

  showStatus(title, message) {
    // Hide other sections
    document.getElementById('resultsSection').style.display = 'none';

    // Show status
    const statusSection = document.getElementById('statusSection');
    statusSection.style.display = 'block';

    document.getElementById('statusTitle').textContent = title;
    document.getElementById('statusMessage').textContent = message;
  }

  showResults(data) {
    // Hide status
    document.getElementById('statusSection').style.display = 'none';

    // Show results
    const resultsSection = document.getElementById('resultsSection');
    resultsSection.style.display = 'block';

    // Parse issues from analysis
    const issues = this.parseIssues(data.analysis.content);

    // Update stats
    document.getElementById('criticalCount').textContent = issues.critical || 0;
    document.getElementById('highCount').textContent = issues.high || 0;
    document.getElementById('mediumCount').textContent = issues.medium || 0;
    document.getElementById('lowCount').textContent = issues.low || 0;

    // Show analysis
    document.getElementById('resultsContent').textContent = data.analysis.content;

    // Show usage
    console.log('💰 API Cost:', `$${data.analysis.usage.totalCost}`);
  }

  showError(message) {
    document.getElementById('statusSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';

    alert(`❌ Error: ${message}`);
  }

  resetUI() {
    document.getElementById('statusSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    this.currentAudit = null;
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  parseIssues(content) {
    // Simple parsing - count emoji markers
    const critical = (content.match(/🔴/g) || []).length;
    const high = (content.match(/🟡/g) || []).length;
    const medium = (content.match(/🟢/g) || []).length;
    const low = (content.match(/🔵/g) || []).length;

    return { critical, high, medium, low };
  }

  exportReport() {
    if (!this.currentAudit) return;

    const report = `
NNH Code Auditor Report
Generated: ${new Date().toISOString()}
Component: ${this.currentAudit.component || 'Unknown'}

${this.currentAudit.analysis.content}

---
API Usage:
- Input Tokens: ${this.currentAudit.analysis.usage.inputTokens}
- Output Tokens: ${this.currentAudit.analysis.usage.outputTokens}
- Cost: $${this.currentAudit.analysis.usage.totalCost}
    `.trim();

    // Create download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    console.log('📥 Report exported');
  }
}

// Initialize app when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.auditorApp = new AuditorApp();
});