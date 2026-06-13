/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "public", "data");
const classDir = path.join(dataDir, "class");
const outputPath = path.join(dataDir, "player-lore.json");
const githubApiBase =
  "https://api.github.com/repos/5etools-mirror-3/5etools-src/contents";

const classFiles = fs
  .readdirSync(classDir)
  .filter((file) => file.startsWith("class-") && file.endsWith(".json"));

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isPlayerSource(entry) {
  return entry.source === "XPHB" || entry.source === "EFA" || entry.edition === "one";
}

function toSlug(name, source) {
  return `${name}-${source}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchGithubJson(repoPath) {
  const url = `${githubApiBase}/${repoPath}?ref=main`;
  const response = await fetch(url, {
    headers: { "User-Agent": "forge-fate-builder" },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Failed ${response.status} for ${repoPath}`);
  }

  const body = await response.json();
  const content = Buffer.from(body.content ?? "", "base64").toString("utf8");

  return JSON.parse(content);
}

async function tryFetchGithubJson(repoPath) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await fetchGithubJson(repoPath);
    } catch (error) {
      if (attempt === 3) {
        console.warn(`Lore fetch failed for ${repoPath}: ${error.message}`);
      }
    }
  }

  return null;
}

function extractLore(fluffEntry, fallbackName) {
  const entries = Array.isArray(fluffEntry?.entries) ? fluffEntry.entries : [];
  const image = fluffEntry?.images?.find((entry) => entry.href?.path);

  return {
    summary: summarizeEntries(entries, fallbackName),
    entries,
    image: image?.href?.path
      ? {
          src: `https://cdn.5e.tools/2024/img/${image.href.path}`,
          alt: `${fallbackName} artwork`,
          credit: image.credit,
        }
      : undefined,
  };
}

function summarizeEntries(entries, fallbackName) {
  const firstText = flattenText(entries).find((entry) => entry.length > 0);

  if (!firstText) {
    return `${fallbackName} precisa de uma descricao narrativa oficial.`;
  }

  return firstText.length > 220 ? `${firstText.slice(0, 217).trim()}...` : firstText;
}

function flattenText(entries) {
  return entries.flatMap((entry) => {
    if (typeof entry === "string") {
      return [stripTags(entry)];
    }

    if (entry && typeof entry === "object") {
      if (Array.isArray(entry.entries)) {
        return flattenText(entry.entries);
      }

      if (typeof entry.entry === "string") {
        return [stripTags(entry.entry)];
      }
    }

    return [];
  });
}

function stripTags(value) {
  return value
    .replace(/@\w+\[([^\]|]+)(?:\|[^\]]+)?\]/g, "$1")
    .replace(/\{@(?:i|b|em|strong)\s+([^}]+)\}/g, "$1")
    .replace(/\{@(?:classFeature|subclass|subclassFeature|class|filter)\s+([^}]+)\}/g, (_match, raw) => {
      return raw.split("|")[0]?.trim() ?? "";
    })
    .replace(/\{@[^}\s]+\s+([^}]+)\}/g, (_match, raw) => {
      const parts = raw.split("|").map((part) => part.trim());
      return parts[2] || parts[0];
    })
    .replace(/\s+/g, " ")
    .trim();
}

function makePlaceholder(name, source, type) {
  return {
    summary: `${name} precisa de uma descricao narrativa oficial.`,
    entries: [
      `${name} (${source}) ainda nao possui lore curada em public/data/player-lore.json. Adicione a descricao oficial para substituir este placeholder.`,
    ],
    placeholder: true,
    type,
  };
}

function indexFluff(entries) {
  return new Map(
    (entries ?? []).map((entry) => [toSlug(entry.name, entry.source), entry]),
  );
}

async function main() {
  const localClasses = classFiles
    .flatMap((file) => readJson(path.join(classDir, file)).class ?? [])
    .filter(isPlayerSource);
  const localSpecies = readJson(path.join(dataDir, "races.json")).race.filter(
    isPlayerSource,
  );
  const localBackgrounds = readJson(path.join(dataDir, "backgrounds.json")).background.filter(
    isPlayerSource,
  );

  const [raceFluffFile, backgroundFluffFile] = await Promise.all([
    tryFetchGithubJson("data/fluff-races.json"),
    tryFetchGithubJson("data/fluff-backgrounds.json"),
  ]);
  const classFluffFiles = await Promise.all(
    classFiles.map((file) =>
      tryFetchGithubJson(`data/class/fluff-${file}`).then((content) => ({
        file,
        content,
      })),
    ),
  );

  const raceFluff = indexFluff(raceFluffFile?.raceFluff);
  const backgroundFluff = indexFluff(backgroundFluffFile?.backgroundFluff);
  const classFluff = indexFluff(
    classFluffFiles.flatMap((entry) => entry.content?.classFluff ?? []),
  );

  const missing = [];
  const lore = {
    class: {},
    species: {},
    background: {},
    missing,
    generatedAt: new Date().toISOString(),
  };

  for (const entry of localClasses) {
    const id = toSlug(entry.name, entry.source);
    const fluff = classFluff.get(id);
    lore.class[id] = fluff
      ? extractLore(fluff, entry.name)
      : makePlaceholder(entry.name, entry.source, "class");
    if (!fluff) missing.push(`class:${id}`);
  }

  for (const entry of localSpecies) {
    const id = toSlug(entry.name, entry.source);
    const fluff = raceFluff.get(id);
    lore.species[id] = fluff
      ? extractLore(fluff, entry.name)
      : makePlaceholder(entry.name, entry.source, "species");
    if (!fluff) missing.push(`species:${id}`);
  }

  for (const entry of localBackgrounds) {
    const id = toSlug(entry.name, entry.source);
    const fluff = backgroundFluff.get(id);
    lore.background[id] = fluff
      ? extractLore(fluff, entry.name)
      : makePlaceholder(entry.name, entry.source, "background");
    if (!fluff) missing.push(`background:${id}`);
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(lore, null, 2)}\n`);
  console.log(
    `Wrote ${outputPath} with ${missing.length} placeholder lore entries.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
