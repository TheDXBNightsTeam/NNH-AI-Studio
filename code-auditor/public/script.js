// Add this function to public/script.js

/**
 * Download fix prompt
 */
downloadFixPrompt() {
  if (!this.currentAudit || !this.currentAudit.fixPrompt) {
    alert('No fix prompt available');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `FIX_PROMPT_${this.currentAudit.component}_${timestamp}.md`;

  // Create download
  const blob = new Blob([this.currentAudit.fixPrompt], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`📥 Fix prompt downloaded: ${filename}`);
  this.showNotification('📥 Fix prompt downloaded', 'success');
}

// Update the exportReport function to include a separate button for fix prompt