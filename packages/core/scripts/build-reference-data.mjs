import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const dataDir = path.resolve(__dirname, "..", "data");

const guidePath = path.resolve(repoRoot, "disc-golf-wind-guide.json");
const basePath = path.resolve(dataDir, "reference-base.json");
const modifiersPath = path.resolve(dataDir, "reference-modifiers.json");
const overridesPath = path.resolve(dataDir, "reference-overrides.json");

const suggestionsOutPath = path.resolve(dataDir, "suggestions.json");
const metaOutPath = path.resolve(dataDir, "wind-guide-meta.json");
const compiledOutPath = path.resolve(dataDir, "reference-compiled.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function joinText(parts) {
  return parts.filter(Boolean).join(" ");
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function buildCompiledReference({
  suggestions,
  base,
  modifiers,
  overrides,
}) {
  const windKeys = Object.keys(suggestions);
  const terrainKeys = Object.keys(suggestions[windKeys[0]] || {});
  const shotKeys = Object.keys(suggestions[windKeys[0]]?.[terrainKeys[0]] || {});
  const releaseAngles = Object.keys(modifiers.releaseAngle || {});
  const discProfiles = Object.keys(base.discProfiles || {});

  const compiled = {
    meta: {
      generatedAt: new Date().toISOString(),
      windKeys,
      terrainKeys,
      shotKeys,
      releaseAngles,
      discProfiles,
    },
    reference: {},
  };

  for (const wind of windKeys) {
    compiled.reference[wind] = {};
    for (const terrain of terrainKeys) {
      compiled.reference[wind][terrain] = {};
      for (const shot of shotKeys) {
        compiled.reference[wind][terrain][shot] = {};
        for (const releaseAngle of releaseAngles) {
          compiled.reference[wind][terrain][shot][releaseAngle] = {};
          for (const profile of discProfiles) {
            const profileData = base.discProfiles[profile];
            const windData = modifiers.wind?.[wind];
            const terrainData = modifiers.terrain?.[terrain];
            const shotData = modifiers.shot?.[shot];
            const releaseData = modifiers.releaseAngle?.[releaseAngle];
            const override = overrides?.[wind]?.[terrain]?.[shot]?.[releaseAngle]?.[profile];

            const explanation = override?.explanation ?? joinText([
              profileData.baseExplanation,
              windData?.explanation,
              terrainData?.explanation,
              shotData?.explanation,
              releaseData?.explanation,
            ]);

            const tips = unique([
              ...(override?.tips || []),
              ...(profileData.baseTips || []),
              ...(windData?.tips || []),
              ...(terrainData?.tips || []),
              ...(shotData?.tips || []),
              ...(releaseData?.tips || []),
            ]);

            compiled.reference[wind][terrain][shot][releaseAngle][profile] = {
              disc: profileData.disc,
              category: profileData.category,
              profile,
              explanation,
              tips,
            };
          }
        }
      }
    }
  }

  return compiled;
}

function main() {
  if (!fs.existsSync(guidePath)) {
    throw new Error(`Missing required source: ${guidePath}`);
  }

  if (!fs.existsSync(basePath)) {
    throw new Error(`Missing required source: ${basePath}`);
  }

  if (!fs.existsSync(modifiersPath)) {
    throw new Error(`Missing required source: ${modifiersPath}`);
  }

  if (!fs.existsSync(overridesPath)) {
    throw new Error(`Missing required source: ${overridesPath}`);
  }

  fs.mkdirSync(dataDir, { recursive: true });

  const guide = readJson(guidePath);
  const base = readJson(basePath);
  const modifiers = readJson(modifiersPath);
  const overrides = readJson(overridesPath);

  const suggestions = guide.wind_guide || {};
  const meta = guide.meta || {};

  const compiledReference = buildCompiledReference({
    suggestions,
    base,
    modifiers,
    overrides,
  });

  writeJson(suggestionsOutPath, suggestions);
  writeJson(metaOutPath, meta);
  writeJson(compiledOutPath, compiledReference);
}

main();
