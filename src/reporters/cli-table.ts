import Table from "cli-table3";
import pc from "picocolors";
import { formatBytes } from "../utils/format";
import type { CheckResult } from "../types";

export function renderTable(results: CheckResult[]): string {
  const table = new Table({
    head: ["File", "Compression", "Actual", "Limit", "Passed"],
  });
  for (const r of results) {
    const passedText = r.passed ? pc.green("yes") : pc.red("no");
    table.push([
      r.file,
      r.compression,
      formatBytes(r.actualSize),
      r.maxSize,
      passedText,
    ]);
  }
  return table.toString();
}
