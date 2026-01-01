// 絶対厳守：編集前に必ずAI実装ルールを読む
import { constants } from "node:fs";
import { access, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SKIP_DIRECTORIES = new Set<string>([
  ".git",
  ".next",
  "coverage",
  "node_modules",
  "playwright-report",
  "test-results",
]);

interface CopyAgentsResult {
  updated: string[];
  unchanged: string[];
  missing: string[];
}

async function findAgentsFiles(rootDir: string): Promise<string[]> {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = join(rootDir, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) {
        continue;
      }
      // シンボリックリンクはスキップして無限ループを防ぐ
      if (entry.isSymbolicLink()) {
        continue;
      }
      files.push(...(await findAgentsFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name === "AGENTS.md") {
      files.push(entryPath);
    }
  }

  return files;
}

function logPaths(header: string, paths: string[], projectRoot: string): void {
  if (paths.length === 0) {
    return;
  }

  console.log(header);
  for (const path of paths) {
    console.log(`  - ${relative(projectRoot, path)}`);
  }
}

async function copyAgentsMarkdown(
  projectRoot: string
): Promise<CopyAgentsResult> {
  const agentsFiles = await findAgentsFiles(projectRoot);
  agentsFiles.sort((a, b) => a.localeCompare(b));

  const results: CopyAgentsResult = {
    updated: [],
    unchanged: [],
    missing: [],
  };

  for (const agentsPath of agentsFiles) {
    const claudePath = join(dirname(agentsPath), "CLAUDE.md");

    const hasClaude = await access(claudePath, constants.F_OK)
      .then(() => true)
      .catch(() => false);

    if (!hasClaude) {
      results.missing.push(agentsPath);
      continue;
    }

    const [agentsText, claudeText] = await Promise.all([
      readFile(agentsPath, "utf-8"),
      readFile(claudePath, "utf-8"),
    ]);

    if (agentsText === claudeText) {
      results.unchanged.push(agentsPath);
      continue;
    }

    await writeFile(claudePath, agentsText, "utf-8");
    results.updated.push(agentsPath);
  }

  return results;
}

async function main(): Promise<number> {
  const currentFile = fileURLToPath(import.meta.url);
  const projectRoot = resolve(dirname(currentFile), "..", "..");

  const results = await copyAgentsMarkdown(projectRoot);
  const totalFound =
    results.updated.length + results.unchanged.length + results.missing.length;

  if (totalFound === 0) {
    console.log("No AGENTS.md files found.");
    return 0;
  }

  logPaths("✅ Updated CLAUDE.md files:", results.updated, projectRoot);
  logPaths("ℹ️  Already up-to-date:", results.unchanged, projectRoot);

  if (results.missing.length > 0) {
    logPaths("⚠️ Missing CLAUDE.md files:", results.missing, projectRoot);
    return 1;
  }

  console.log("All CLAUDE.md files are up to date.");
  return 0;
}

main()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error("Unexpected error occurred while syncing CLAUDE.md files.");
    console.error(error);
    process.exit(1);
  });
