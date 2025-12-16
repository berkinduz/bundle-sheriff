import { readFile } from "node:fs/promises";
import fg from "fast-glob";
import { gzipSizeSync } from "gzip-size";
import { sync as brotliSizeSync } from "brotli-size";
import type { FileStats } from "../types";

export async function getFileStats(filePath: string): Promise<FileStats> {
  try {
    const buffer = await readFile(filePath);
    const gzip = gzipSizeSync(buffer);
    const brotli = brotliSizeSync(buffer);

    return {
      path: filePath,
      rawSize: buffer.length,
      gzipSize: gzip,
      brotliSize: brotli,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to analyze file '${filePath}': ${message}`);
  }
}

export async function analyzePaths(
  pattern: string | string[]
): Promise<FileStats[]> {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  try {
    const files = await fg(patterns, { absolute: true, dot: false });
    const stats = await Promise.all(files.map(getFileStats));
    return stats;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to analyze paths for patterns ${JSON.stringify(
        patterns
      )}: ${message}`
    );
  }
}
