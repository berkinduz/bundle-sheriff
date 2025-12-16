import { loadConfig as _loadConfig } from "unconfig";
import bytes from "bytes";
import type { SheriffConfig } from "../types";

export async function loadConfig(
  cwd: string = process.cwd()
): Promise<SheriffConfig> {
  try {
    const { config } = await _loadConfig<SheriffConfig>({
      sources: [{ files: "sheriff.config" }],
      cwd,
    });

    if (config && Array.isArray(config.rules)) {
      return config;
    }

    return { rules: [] };
  } catch (err) {
    // If loading fails (missing file, parse error), surface a minimal default
    return { rules: [] };
  }
}

export function checkLimit(actualSize: number, maxSizeStr: string): boolean {
  const parsed = bytes(maxSizeStr);
  if (typeof parsed !== "number" || !Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid maxSize '${maxSizeStr}'. Expected a size like '150kb'.`
    );
  }
  return actualSize <= parsed;
}
