const fs = require('fs').promises;
const path = require('path');

class FileHandler {
  constructor(baseDir = null) {
    // Use provided baseDir or current working directory
    this.baseDir = baseDir || process.cwd();
    console.log(`📁 Base directory: ${this.baseDir}`);
  }

  /**
   * Read dashboard-related files
   */
  async readDashboardFiles() {
    const filePaths = [
      'app/[locale]/(dashboard)/dashboard/page.tsx',
      'components/dashboard/stats-cards.tsx',
      'components/dashboard/ai-insights-card.tsx',
      'components/dashboard/quick-actions-bar.tsx',
      'components/dashboard/weekly-tasks-widget.tsx',
      'components/dashboard/performance-comparison-chart.tsx',
      'components/dashboard/location-highlights-carousel.tsx',
      'app/api/dashboard/stats/route.ts',
    ];

    const files = [];

    for (const filePath of filePaths) {
      try {
        const fullPath = path.join(this.baseDir, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');

        files.push({
          path: filePath,
          content: content,
          lines: content.split('\n').length,
          size: Buffer.byteLength(content, 'utf-8')
        });

        console.log(`✅ Read: ${filePath} (${content.split('\n').length} lines)`);

      } catch (error) {
        console.warn(`⚠️ Could not read ${filePath}: ${error.message}`);
      }
    }

    if (files.length === 0) {
      throw new Error('No dashboard files found. Make sure you are in the correct project directory.');
    }

    console.log(`📊 Total files read: ${files.length}`);
    return files;
  }

  /**
   * Read any component files by name
   */
  async readComponentFiles(componentName) {
    const componentPaths = {
      dashboard: [
        'app/[locale]/(dashboard)/dashboard/page.tsx',
        'components/dashboard/**/*.tsx',
        'app/api/dashboard/stats/route.ts',
      ],
      locations: [
        'app/[locale]/(dashboard)/locations/page.tsx',
        'components/locations/**/*.tsx',
      ],
      reviews: [
        'app/[locale]/(dashboard)/reviews/page.tsx',
        'components/reviews/**/*.tsx',
      ],
      questions: [
        'app/[locale]/(dashboard)/questions/page.tsx',
        'components/questions/**/*.tsx',
      ]
    };

    const paths = componentPaths[componentName] || [];

    // For now, just read dashboard files
    // TODO: Implement glob pattern matching for wildcards
    return await this.readDashboardFiles();
  }

  /**
   * Apply a fix to a file
   */
  async applyFix(fix) {
    try {
      const { file, oldCode, newCode } = fix;

      if (!file || !oldCode || !newCode) {
        return {
          success: false,
          file: file || 'unknown',
          error: 'Invalid fix format. Need: file, oldCode, newCode'
        };
      }

      const fullPath = path.join(this.baseDir, file);

      // Check if file exists
      try {
        await fs.access(fullPath);
      } catch {
        return {
          success: false,
          file,
          error: 'File not found'
        };
      }

      // Read current content
      const content = await fs.readFile(fullPath, 'utf-8');

      // Check if old code exists
      if (!content.includes(oldCode)) {
        return {
          success: false,
          file,
          error: 'Old code not found in file (already fixed or incorrect pattern)'
        };
      }

      // Apply replacement
      const newContent = content.replace(oldCode, newCode);

      // Backup original file
      await this.backupFile(fullPath);

      // Write new content
      await fs.writeFile(fullPath, newContent, 'utf-8');

      console.log(`✅ Fixed: ${file}`);

      return {
        success: true,
        file,
        linesChanged: newCode.split('\n').length
      };

    } catch (error) {
      console.error(`❌ Error applying fix to ${fix.file}:`, error);
      return {
        success: false,
        file: fix.file,
        error: error.message
      };
    }
  }

  /**
   * Backup a file before modifying
   */
  async backupFile(filePath) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${filePath}.backup-${timestamp}`;
      await fs.copyFile(filePath, backupPath);
      console.log(`💾 Backup created: ${backupPath}`);
    } catch (error) {
      console.warn(`⚠️ Could not create backup: ${error.message}`);
    }
  }

  /**
   * List all backups for a file
   */
  async listBackups(filePath) {
    const dir = path.dirname(filePath);
    const filename = path.basename(filePath);

    try {
      const files = await fs.readdir(dir);
      const backups = files.filter(f => f.startsWith(`${filename}.backup-`));
      return backups;
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }
}

// ✅ CORRECT EXPORT
module.exports = FileHandler;