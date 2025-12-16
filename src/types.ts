export interface FileStats {
  path: string;
  rawSize: number;
  gzipSize: number;
  brotliSize: number;
}

export interface BundleRule {
  path: string;
  maxSize: string;
  compression?: "raw" | "gzip" | "brotli";
}

export interface SheriffConfig {
  rules: BundleRule[];
}

export interface CheckResult {
  file: string;
  compression: "raw" | "gzip" | "brotli";
  actualSize: number;
  maxSize: string;
  passed: boolean;
}
