// fileHandler.js
import fs from "fs";
import path from "path";

/**
 * Recursively collect code files from a directory (TS, TSX, JS, JSX)
 */
export function collectFiles(targetDir) {
  const result = [];

  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, "utf8");
        result.push({
          path: fullPath,
          content,
          lines: content.split("\n").length,
          size: Buffer.byteLength(content, "utf8"),
        });
      }
    }
  }

  traverse(targetDir);
  return result;
}