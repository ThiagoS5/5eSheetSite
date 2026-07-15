/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "public", "data");
const allowedDomains = [
  "class",
  "spells",
  "items",
  "races",
  "backgrounds",
  "feats",
  "optionalfeatures",
  "languages",
  "conditions",
];

// Files inside allowed domains that no code imports (see src/services/*).
// spells-egw/ggr have no entry in spells/sources.json, so their spells can
// never be assigned to a class in the picker.
const unusedFiles = [
  "conditionsdiseases.json",
  "optionalfeatures.json",
  "foundry-feats.json",
  "foundry-items.json",
  "foundry-optionalfeatures.json",
  "foundry-races.json",
  "class/class-mystic.json",
  "class/class-sidekick.json",
  "class/foundry.json",
  "class/index.json",
  "spells/foundry.json",
  "spells/index.json",
  "spells/spells-egw.json",
  "spells/spells-ggr.json",
];

function assertInsideDataDir(targetPath) {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedDataDir = path.resolve(dataDir);

  if (
    resolvedTarget !== resolvedDataDir &&
    !resolvedTarget.startsWith(`${resolvedDataDir}${path.sep}`)
  ) {
    throw new Error(`Refusing to delete outside public/data: ${resolvedTarget}`);
  }
}

function getEntrySize(targetPath) {
  const stats = fs.lstatSync(targetPath);

  if (!stats.isDirectory()) {
    return stats.size;
  }

  return fs.readdirSync(targetPath).reduce(
    (total, entry) => total + getEntrySize(path.join(targetPath, entry)),
    0,
  );
}

function countEntries(targetPath) {
  const stats = fs.lstatSync(targetPath);

  if (!stats.isDirectory()) {
    return { files: 1, directories: 0 };
  }

  return fs.readdirSync(targetPath).reduce(
    (total, entry) => {
      const childCount = countEntries(path.join(targetPath, entry));

      return {
        files: total.files + childCount.files,
        directories: total.directories + childCount.directories,
      };
    },
    { files: 0, directories: 1 },
  );
}

function isAllowedRootEntry(entryName) {
  const baseName = entryName.toLowerCase().replace(/\.[^.]+$/, "");

  if (baseName === "player-lore") {
    return true;
  }

  if (baseName === "fluff" || baseName.startsWith("fluff-")) {
    return false;
  }

  return allowedDomains.some(
    (domain) =>
      baseName === domain ||
      baseName.startsWith(domain) ||
      baseName.includes(`-${domain}`),
  );
}

function isFluffEntry(entryName) {
  const baseName = entryName.toLowerCase().replace(/\.[^.]+$/, "");

  return baseName === "fluff" || baseName.startsWith("fluff-");
}

function removeEntry(targetPath) {
  assertInsideDataDir(targetPath);

  const size = getEntrySize(targetPath);
  const count = countEntries(targetPath);

  fs.rmSync(targetPath, { recursive: true, force: true });

  return { size, files: count.files, directories: count.directories };
}

function pruneFluffEntries(targetDir) {
  let removed = { size: 0, files: 0, directories: 0 };

  for (const entry of fs.readdirSync(targetDir)) {
    const entryPath = path.join(targetDir, entry);

    if (isFluffEntry(entry)) {
      const stats = removeEntry(entryPath);
      removed = addStats(removed, stats);
      continue;
    }

    if (fs.existsSync(entryPath) && fs.lstatSync(entryPath).isDirectory()) {
      removed = addStats(removed, pruneFluffEntries(entryPath));
    }
  }

  return removed;
}

function addStats(first, second) {
  return {
    size: first.size + second.size,
    files: first.files + second.files,
    directories: first.directories + second.directories,
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function main() {
  if (!fs.existsSync(dataDir)) {
    throw new Error(`Data directory not found: ${dataDir}`);
  }

  assertInsideDataDir(dataDir);

  let removed = { size: 0, files: 0, directories: 0 };

  for (const entry of fs.readdirSync(dataDir)) {
    const entryPath = path.join(dataDir, entry);

    if (!isAllowedRootEntry(entry)) {
      removed = addStats(removed, removeEntry(entryPath));
    }
  }

  removed = addStats(removed, pruneFluffEntries(dataDir));

  for (const relativePath of unusedFiles) {
    const entryPath = path.join(dataDir, relativePath);
    if (fs.existsSync(entryPath)) {
      removed = addStats(removed, removeEntry(entryPath));
    }
  }

  console.log(
    `Removed ${removed.files} files and ${removed.directories} directories (${formatBytes(
      removed.size,
    )}).`,
  );
}

main();
