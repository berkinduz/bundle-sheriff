#!/usr/bin/env node

// src/index.ts
import cac from "cac";
import pc2 from "picocolors";

// src/core/analyzer.ts
import { readFile } from "fs/promises";
import fg from "fast-glob";
import { gzipSizeSync } from "gzip-size";
import { sync as brotliSizeSync } from "brotli-size";
async function getFileStats(filePath) {
  try {
    const buffer = await readFile(filePath);
    const gzip = gzipSizeSync(buffer);
    const brotli = brotliSizeSync(buffer);
    return {
      path: filePath,
      rawSize: buffer.length,
      gzipSize: gzip,
      brotliSize: brotli
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to analyze file '${filePath}': ${message}`);
  }
}
async function analyzePaths(pattern) {
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

// src/core/config.ts
import { loadConfig as _loadConfig } from "unconfig";
import bytes from "bytes";
async function loadConfig(cwd = process.cwd()) {
  try {
    const { config } = await _loadConfig({
      sources: [{ files: "sheriff.config" }],
      cwd
    });
    if (config && Array.isArray(config.rules)) {
      return config;
    }
    return { rules: [] };
  } catch (err) {
    return { rules: [] };
  }
}
function checkLimit(actualSize, maxSizeStr) {
  const parsed = bytes(maxSizeStr);
  if (typeof parsed !== "number" || !Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid maxSize '${maxSizeStr}'. Expected a size like '150kb'.`
    );
  }
  return actualSize <= parsed;
}

// src/reporters/cli-table.ts
import Table from "cli-table3";
import pc from "picocolors";

// src/utils/format.ts
import bytes2 from "bytes";
function formatBytes(value) {
  if (!Number.isFinite(value) || value < 0) return "n/a";
  return bytes2(value, { unitSeparator: " " });
}

// src/reporters/cli-table.ts
function renderTable(results) {
  const table = new Table({
    head: ["File", "Compression", "Actual", "Limit", "Passed"]
  });
  for (const r of results) {
    const passedText = r.passed ? pc.green("yes") : pc.red("no");
    table.push([
      r.file,
      r.compression,
      formatBytes(r.actualSize),
      r.maxSize,
      passedText
    ]);
  }
  return table.toString();
}

// src/index.ts
var cli = cac("bundle-sheriff");
async function runCheck(cwd) {
  const config = await loadConfig(cwd);
  if (!config || !Array.isArray(config.rules) || config.rules.length === 0) {
    console.error(pc2.red("No sheriff config found or no rules defined."));
    process.exit(1);
    return;
  }
  const results = [];
  for (const rule of config.rules) {
    const files = await analyzePaths(rule.path);
    const compression = rule.compression ?? "gzip";
    for (const f of files) {
      const actual = compression === "raw" ? f.rawSize : compression === "brotli" ? f.brotliSize : f.gzipSize;
      const passed = checkLimit(actual, rule.maxSize);
      results.push({
        file: f.path,
        compression,
        actualSize: actual,
        maxSize: rule.maxSize,
        passed
      });
    }
  }
  const output = renderTable(results);
  console.log(output);
  const anyFailed = results.some((r) => !r.passed);
  process.exit(anyFailed ? 1 : 0);
}
cli.command("check", "Check bundle budgets defined in sheriff.config").option("--cwd <dir>", "Working directory", { default: process.cwd() }).action(async (opts) => {
  const cwd = opts.cwd || process.cwd();
  await runCheck(cwd);
});
cli.command("", "Default: check budgets").action(async () => {
  await runCheck(process.cwd());
});
cli.help();
cli.version("0.1.0");
cli.parse();
//# sourceMappingURL=index.js.map