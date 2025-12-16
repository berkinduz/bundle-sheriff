import cac from "cac";
import pc from "picocolors";
import { analyzePaths } from "./core/analyzer";
import { loadConfig, checkLimit } from "./core/config";
import { renderTable } from "./reporters/cli-table";
import type { CheckResult, BundleRule } from "./types";

const cli = cac("bundle-sheriff");

async function runCheck(cwd: string) {
  const config = await loadConfig(cwd);
  if (!config || !Array.isArray(config.rules) || config.rules.length === 0) {
    console.error(pc.red("No sheriff config found or no rules defined."));
    process.exit(1);
    return;
  }

  const results: CheckResult[] = [];
  for (const rule of config.rules as BundleRule[]) {
    const files = await analyzePaths(rule.path);
    const compression = rule.compression ?? "gzip";
    for (const f of files) {
      const actual =
        compression === "raw"
          ? f.rawSize
          : compression === "brotli"
          ? f.brotliSize
          : f.gzipSize;
      const passed = checkLimit(actual, rule.maxSize);
      results.push({
        file: f.path,
        compression,
        actualSize: actual,
        maxSize: rule.maxSize,
        passed,
      });
    }
  }

  const output = renderTable(results);
  console.log(output);

  const anyFailed = results.some((r) => !r.passed);
  process.exit(anyFailed ? 1 : 0);
}

cli
  .command("check", "Check bundle budgets defined in sheriff.config")
  .option("--cwd <dir>", "Working directory", { default: process.cwd() })
  .action(async (opts: { cwd?: string }) => {
    const cwd = opts.cwd || process.cwd();
    await runCheck(cwd);
  });

// Default command: run check when no subcommand provided
cli.command("", "Default: check budgets").action(async () => {
  await runCheck(process.cwd());
});

cli.help();
cli.version("0.1.0");
cli.parse();
