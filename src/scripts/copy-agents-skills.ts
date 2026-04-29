/**
 * .agents/skills/ の内容を .claude/skills/ にコピー同期するスクリプト。
 *
 * 本来であれば .claude/skills を .agents/skills へのシンボリックリンクに
 * すれば本スクリプトは不要になる。しかし Claude Code には現時点で
 * .claude/skills/ 配下のシンボリックリンクが Skill 自動発見プロセスで
 * 追跡されない既知の不具合がある（下記 Issue 参照）。
 *
 * Issue が解決した時点で本スクリプトを削除し、以下のシンボリックリンク
 * 方式に移行する：
 *
 *   ln -s ../.agents/skills .claude/skills
 *
 * 関連 Issue:
 * - https://github.com/anthropics/claude-code/issues/14836
 * - https://github.com/anthropics/claude-code/issues/37590
 * - https://github.com/anthropics/claude-code/issues/25367
 */
import { constants } from "node:fs";
import {
  access,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_DIR_NAME = ".agents/skills";
const TARGET_DIR_NAME = ".claude/skills";

interface SyncResult {
  readonly copied: string[];
  readonly removed: string[];
  readonly unchanged: string[];
}

function pathExists(path: string): Promise<boolean> {
  return access(path, constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

async function collectFiles(rootDir: string): Promise<string[]> {
  const exists = await pathExists(rootDir);
  if (!exists) {
    return [];
  }

  const files: string[] = [];
  const entries = await readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

async function syncFile(
  sourcePath: string,
  targetPath: string,
  result: SyncResult
): Promise<void> {
  const sourceContent = await readFile(sourcePath);
  const targetExists = await pathExists(targetPath);

  if (targetExists) {
    const targetContent = await readFile(targetPath);
    if (sourceContent.equals(targetContent)) {
      result.unchanged.push(targetPath);
      return;
    }
  }

  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, sourceContent);
  result.copied.push(targetPath);
}

async function removeOrphanFiles(
  sourceRoot: string,
  targetRoot: string,
  result: SyncResult
): Promise<void> {
  const targetExists = await pathExists(targetRoot);
  if (!targetExists) {
    return;
  }

  const targetFiles = await collectFiles(targetRoot);

  for (const targetPath of targetFiles) {
    const relativePath = relative(targetRoot, targetPath);
    const sourcePath = join(sourceRoot, relativePath);
    const sourceExists = await pathExists(sourcePath);

    if (!sourceExists) {
      await rm(targetPath);
      result.removed.push(targetPath);
    }
  }
}

async function syncSkills(projectRoot: string): Promise<SyncResult> {
  const sourceRoot = join(projectRoot, SOURCE_DIR_NAME);
  const targetRoot = join(projectRoot, TARGET_DIR_NAME);

  const result: SyncResult = {
    copied: [],
    removed: [],
    unchanged: [],
  };

  const sourceExists = await pathExists(sourceRoot);
  if (!sourceExists) {
    return result;
  }

  const sourceFiles = await collectFiles(sourceRoot);
  sourceFiles.sort((a, b) => a.localeCompare(b));

  for (const sourcePath of sourceFiles) {
    const relativePath = relative(sourceRoot, sourcePath);
    const targetPath = join(targetRoot, relativePath);
    await syncFile(sourcePath, targetPath, result);
  }

  await removeOrphanFiles(sourceRoot, targetRoot, result);

  return result;
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

async function main(): Promise<number> {
  const currentFile = fileURLToPath(import.meta.url);
  const projectRoot = resolve(dirname(currentFile), "..", "..");

  const result = await syncSkills(projectRoot);

  logPaths("✅ Copied to .claude/skills/:", result.copied, projectRoot);
  logPaths("🧹 Removed from .claude/skills/:", result.removed, projectRoot);
  logPaths("ℹ️  Already up-to-date:", result.unchanged, projectRoot);

  const totalChanged = result.copied.length + result.removed.length;
  if (totalChanged === 0) {
    console.log(".claude/skills/ is already synced with .agents/skills/.");
  } else {
    console.log(
      `Synced ${result.copied.length} file(s), removed ${result.removed.length} orphan file(s).`
    );
  }

  return 0;
}

main()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error(
      "Unexpected error occurred while syncing .agents/skills to .claude/skills."
    );
    console.error(error);
    process.exit(1);
  });
