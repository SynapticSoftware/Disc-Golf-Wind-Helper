import recommendationsSource from "../data/recommendations.json" with { type: "json" };
import { AppError } from "./errors.js";

const WIND_CONFIG = [
  {
    id: "no_wind",
    sourceKey: "no_wind",
    label: "No Wind",
    icon: "○",
    desc: "Calm conditions",
  },
  {
    id: "headwind",
    sourceKey: "headwind",
    label: "Headwind",
    icon: "↓",
    desc: "Wind coming straight at you",
  },
  {
    id: "tailwind",
    sourceKey: "tailwind",
    label: "Tailwind",
    icon: "↑",
    desc: "Wind pushing from behind",
  },
  {
    id: "right_to_left",
    sourceKey: "right_to_left",
    label: "R→L Cross",
    icon: "←",
    desc: "Wind blowing right to left",
  },
  {
    id: "left_to_right",
    sourceKey: "left_to_right",
    label: "L→R Cross",
    icon: "→",
    desc: "Wind blowing left to right",
  },
  {
    id: "headwind_right_to_left",
    sourceKey: "headwind_right_to_left",
    label: "Head + R→L",
    icon: "↙",
    desc: "Headwind with right-to-left component",
  },
  {
    id: "headwind_left_to_right",
    sourceKey: "headwind_left_to_right",
    label: "Head + L→R",
    icon: "↘",
    desc: "Headwind with left-to-right component",
  },
  {
    id: "tailwind_right_to_left",
    sourceKey: "tailwind_right_to_left",
    label: "Tail + R→L",
    icon: "↖",
    desc: "Tailwind with right-to-left component",
  },
  {
    id: "tailwind_left_to_right",
    sourceKey: "tailwind_left_to_right",
    label: "Tail + L→R",
    icon: "↗",
    desc: "Tailwind with left-to-right component",
  },
];

const TERRAIN_CONFIG = [
  {
    id: "uphill",
    sourceKey: "uphill",
    label: "Uphill",
    icon: "⬆️",
    desc: "Throwing up a slope",
  },
  {
    id: "flat",
    sourceKey: "flat",
    label: "Flat",
    icon: "➡️",
    desc: "Level ground, no elevation change",
  },
  {
    id: "downhill",
    sourceKey: "downhill",
    label: "Downhill",
    icon: "⬇️",
    desc: "Throwing down a slope",
  },
];

const SHOT_CONFIG = [
  {
    id: "straight",
    sourceKey: "straight",
    label: "Straight",
    icon: "➡️",
    desc: "Flies as directly at target as possible",
  },
  {
    id: "long_left",
    sourceKey: "long_left",
    label: "Long Left Curve",
    icon: "↩️",
    desc: "Big sweeping arc finishing left",
  },
  {
    id: "short_left",
    sourceKey: "short_left",
    label: "Short Left Fade",
    icon: "↖️",
    desc: "Tight left fade at end, not much distance",
  },
  {
    id: "long_right",
    sourceKey: "long_right",
    label: "Long Right Curve",
    icon: "↪️",
    desc: "Big sweeping arc finishing right",
  },
  {
    id: "short_right",
    sourceKey: "short_right",
    label: "Short Right Turn",
    icon: "↗️",
    desc: "Tight right curve, not much distance",
  },
  {
    id: "s_curve",
    sourceKey: "s_curve",
    label: "S-Curve",
    icon: "〰️",
    desc: "Goes one way then curves back the other",
  },
  {
    id: "distance",
    sourceKey: "distance",
    label: "Distance",
    icon: "🚀",
    desc: "Get it as far as possible",
  },
  {
    id: "putting",
    sourceKey: "putting",
    label: "Putting",
    icon: "🏹",
    desc: "Short controlled throw into the basket",
  },
];

const RELEASE_ANGLE_FALLBACK = ["hyzer", "flat", "anhyzer"];

const WIND_ID_TO_SOURCE = Object.fromEntries(
  WIND_CONFIG.map((entry) => [entry.id, entry.sourceKey])
);

const TERRAIN_ID_TO_SOURCE = Object.fromEntries(
  TERRAIN_CONFIG.map((entry) => [entry.id, entry.sourceKey])
);

const SHOT_ID_TO_SOURCE = Object.fromEntries(
  SHOT_CONFIG.map((entry) => [entry.id, entry.sourceKey])
);

const WIND_CONFIG_BY_ID = Object.fromEntries(
  WIND_CONFIG.map((entry) => [entry.id, entry])
);

const TERRAIN_CONFIG_BY_ID = Object.fromEntries(
  TERRAIN_CONFIG.map((entry) => [entry.id, entry])
);

const SHOT_CONFIG_BY_ID = Object.fromEntries(
  SHOT_CONFIG.map((entry) => [entry.id, entry])
);

const MIRRORED_WIND_ID = {
  left_to_right: "right_to_left",
  right_to_left: "left_to_right",
  headwind_left_to_right: "headwind_right_to_left",
  headwind_right_to_left: "headwind_left_to_right",
  tailwind_left_to_right: "tailwind_right_to_left",
  tailwind_right_to_left: "tailwind_left_to_right",
};

const MIRRORED_SHOT_ID = {
  short_left: "short_right",
  short_right: "short_left",
  long_left: "long_right",
  long_right: "long_left",
};

const TOKEN_SWAP_PAIRS = [
  ["right-to-left", "left-to-right"],
  ["Right-to-left", "Left-to-right"],
  ["RIGHT-TO-LEFT", "LEFT-TO-RIGHT"],
  ["right to left", "left to right"],
  ["Right to left", "Left to right"],
  ["RIGHT TO LEFT", "LEFT TO RIGHT"],
  ["R-to-L", "L-to-R"],
  ["r-to-l", "l-to-r"],
  ["R→L", "L→R"],
  ["RHBH", "RHFH"],
  ["LHBH", "LHFH"],
  ["Right-Hand Backhand", "Right-Hand Forehand"],
  ["Left-Hand Backhand", "Left-Hand Forehand"],
  ["right-hand backhand", "right-hand forehand"],
  ["left-hand backhand", "left-hand forehand"],
  ["left", "right"],
  ["Left", "Right"],
  ["LEFT", "RIGHT"],
];

const TOKEN_SWAP_MAP = new Map(
  TOKEN_SWAP_PAIRS.flatMap(([tokenA, tokenB]) => [
    [tokenA, tokenB],
    [tokenB, tokenA],
  ])
);

const TOKEN_SWAP_MATCHER = new RegExp(
  Array.from(TOKEN_SWAP_MAP.keys())
    .sort((tokenA, tokenB) => tokenB.length - tokenA.length)
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|"),
  "g"
);

export const DEFAULT_THROW_PERSPECTIVE = "rhbh_lhfh";
export const ALTERNATE_THROW_PERSPECTIVE = "rhfh_lhbh";

const THROW_PERSPECTIVE_SET = new Set([
  DEFAULT_THROW_PERSPECTIVE,
  ALTERNATE_THROW_PERSPECTIVE,
]);

export const THROW_PERSPECTIVES = [
  {
    id: DEFAULT_THROW_PERSPECTIVE,
    label: "RHBH / LHFH",
    desc: "Default orientation",
  },
  {
    id: ALTERNATE_THROW_PERSPECTIVE,
    label: "RHFH / LHBH",
    desc: "Mirrored orientation",
  },
];

/**
 * Check whether a value is a supported throw perspective id.
 *
 * @param {string} value Candidate perspective id.
 * @returns {boolean} True when value matches a supported perspective.
 */
export function isThrowPerspective(value) {
  return THROW_PERSPECTIVE_SET.has(value);
}

const DISC_ORDER = {
  understable: 0,
  stable: 1,
  overstable: 2,
};

const CATEGORY_ORDER = {
  driver: 0,
  mid: 1,
  putter: 2,
};

const CATEGORY_COMPARISON_ORDER = ["driver", "mid", "putter"];

const PRIMARY_CATEGORY_ANCHOR_BONUS = 5;

const SHOT_FIT_SCORES = {
  max_distance: {
    driver: 48,
    mid: 24,
    putter: 8,
  },
  long_shape: {
    driver: 44,
    mid: 26,
    putter: 10,
  },
  straight: {
    driver: 34,
    mid: 32,
    putter: 20,
  },
  short_shape: {
    driver: 18,
    mid: 40,
    putter: 30,
  },
  putting: {
    driver: 4,
    mid: 18,
    putter: 52,
  },
};

const WIND_FIT_SCORES = {
  calm: {
    driver: 8,
    mid: 8,
    putter: 8,
  },
  headwind: {
    driver: 13,
    mid: 8,
    putter: 4,
  },
  tailwind: {
    driver: 10,
    mid: 9,
    putter: 7,
  },
  crosswind: {
    driver: 9,
    mid: 10,
    putter: 8,
  },
  headwind_cross: {
    driver: 12,
    mid: 8,
    putter: 4,
  },
  tailwind_cross: {
    driver: 10,
    mid: 9,
    putter: 6,
  },
};

const TERRAIN_FIT_SCORES = {
  uphill: {
    driver: 10,
    mid: 8,
    putter: 5,
  },
  flat: {
    driver: 8,
    mid: 8,
    putter: 8,
  },
  downhill: {
    driver: 6,
    mid: 8,
    putter: 10,
  },
};

export const WIND_DIRECTIONS = WIND_CONFIG.map(({ id, label, icon, desc }) => ({
  id,
  label,
  icon,
  desc,
}));

export const TERRAIN_TYPES = TERRAIN_CONFIG.map(({ id, label, icon, desc }) => ({
  id,
  label,
  icon,
  desc,
}));

export const SHOT_SHAPES = SHOT_CONFIG.map(({ id, label, icon, desc }) => ({
  id,
  label,
  icon,
  desc,
}));

export const windGuideMeta = recommendationsSource?.meta || {};

function mirrorDirectionalText(text) {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }

  const replacements = [];
  let replacementIndex = 0;
  const placeholderText = text.replace(TOKEN_SWAP_MATCHER, (match) => {
    const placeholder = `__swap_token_${replacementIndex}__`;
    replacementIndex += 1;
    replacements.push({
      placeholder,
      value: TOKEN_SWAP_MAP.get(match) || match,
    });
    return placeholder;
  });

  return replacements.reduce(
    (output, replacement) =>
      output.split(replacement.placeholder).join(replacement.value),
    placeholderText
  );
}

function throwAppError(functionName, userMessage, debugContext) {
  const err = new AppError(userMessage, debugContext);
  console.error(`[${functionName}]`, err);
  throw err;
}

function toThrowPerspective(functionName, perspective) {
  const normalizedPerspective = perspective || DEFAULT_THROW_PERSPECTIVE;
  if (!THROW_PERSPECTIVE_SET.has(normalizedPerspective)) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Unknown throw perspective: ${normalizedPerspective}`
    );
  }

  return normalizedPerspective;
}

function shouldMirrorPerspective(perspective) {
  return perspective === ALTERNATE_THROW_PERSPECTIVE;
}

function mirrorDirectionalId(id, mirrorMap) {
  return mirrorMap[id] || id;
}

function toSourceDirectionalId(id, mirrorMap, perspective) {
  if (!shouldMirrorPerspective(perspective)) {
    return id;
  }
  return mirrorDirectionalId(id, mirrorMap);
}

function toDisplayDirectionalId(id, mirrorMap, perspective) {
  if (!shouldMirrorPerspective(perspective)) {
    return id;
  }
  return mirrorDirectionalId(id, mirrorMap);
}

function mirrorTextForPerspective(value, perspective) {
  if (!shouldMirrorPerspective(perspective)) {
    return value;
  }
  return mirrorDirectionalText(value);
}

function getDirectionalOptionByPerspective(option, byId, mirrorMap, perspective) {
  if (!shouldMirrorPerspective(perspective)) {
    return option;
  }

  const mirroredOption = byId[mirrorDirectionalId(option.id, mirrorMap)] || option;
  return {
    id: option.id,
    label: mirroredOption.label,
    icon: mirroredOption.icon,
    desc: mirroredOption.desc,
  };
}

/**
 * Get wind direction options for a throw perspective.
 *
 * @param {string} [perspective='rhbh_lhfh'] Throw perspective.
 * @returns {{id: string, label: string, icon: string, desc: string}[]} Wind options.
 */
export function getWindDirections(perspective = DEFAULT_THROW_PERSPECTIVE) {
  const selectedPerspective = toThrowPerspective(
    "getWindDirections",
    perspective
  );
  return WIND_DIRECTIONS.map((wind) =>
    getDirectionalOptionByPerspective(
      wind,
      WIND_CONFIG_BY_ID,
      MIRRORED_WIND_ID,
      selectedPerspective
    )
  );
}

/**
 * Get shot shape options for a throw perspective.
 *
 * @param {string} [perspective='rhbh_lhfh'] Throw perspective.
 * @returns {{id: string, label: string, icon: string, desc: string}[]} Shot options.
 */
export function getShotShapes(perspective = DEFAULT_THROW_PERSPECTIVE) {
  const selectedPerspective = toThrowPerspective("getShotShapes", perspective);
  return SHOT_SHAPES.map((shot) =>
    getDirectionalOptionByPerspective(
      shot,
      SHOT_CONFIG_BY_ID,
      MIRRORED_SHOT_ID,
      selectedPerspective
    )
  );
}

/**
 * Get metadata text for a throw perspective.
 *
 * @param {string} [perspective='rhbh_lhfh'] Throw perspective.
 * @returns {object} Mirrored metadata when required by perspective.
 */
export function getWindGuideMeta(perspective = DEFAULT_THROW_PERSPECTIVE) {
  const selectedPerspective = toThrowPerspective("getWindGuideMeta", perspective);
  if (!shouldMirrorPerspective(selectedPerspective)) {
    return windGuideMeta;
  }

  return {
    ...windGuideMeta,
    perspective: mirrorTextForPerspective(
      windGuideMeta?.perspective || "",
      selectedPerspective
    ),
    note: mirrorTextForPerspective(windGuideMeta?.note || "", selectedPerspective),
  };
}

function ensureArray(functionName, value, name) {
  if (!Array.isArray(value)) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `${name} must be an array`
    );
  }

  return value;
}

function ensureString(functionName, value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `${name} must be a non-empty string`
    );
  }

  return value;
}

function ensureTipsArray(functionName, value, name) {
  const tips = ensureArray(functionName, value, name);
  for (const tip of tips) {
    ensureString(functionName, tip, `${name} tip`);
  }
  return tips;
}

function parseSingleSuggestedValue(functionName, suggestedFor, dimension, context) {
  const dimensionValues = suggestedFor?.[dimension];
  if (!Array.isArray(dimensionValues) || dimensionValues.length !== 1) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `${context} suggestedFor.${dimension} must contain exactly one value`
    );
  }

  return ensureString(
    functionName,
    dimensionValues[0],
    `${context} suggestedFor.${dimension}[0]`
  );
}

function validateFactorSupportValue(functionName, payload, context) {
  if (!payload || typeof payload !== "object") {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Missing factor support payload for ${context}`
    );
  }

  return {
    explanation: ensureString(
      functionName,
      payload.explanation,
      `${context} explanation`
    ),
    tip: ensureString(functionName, payload.tip, `${context} tip`),
  };
}

function validateNormalizedSource(functionName, sourceData) {
  const dimensions = sourceData?.dimensions || {};
  const wind = ensureArray(functionName, dimensions.wind, "dimensions.wind");
  const terrain = ensureArray(
    functionName,
    dimensions.terrain,
    "dimensions.terrain"
  );
  const shot = ensureArray(functionName, dimensions.shot, "dimensions.shot");
  const releaseAngle = ensureArray(
    functionName,
    dimensions.releaseAngle || RELEASE_ANGLE_FALLBACK,
    "dimensions.releaseAngle"
  );
  const discProfiles = ensureArray(
    functionName,
    dimensions.discProfiles,
    "dimensions.discProfiles"
  );

  const profiles = ensureArray(functionName, sourceData?.profiles, "profiles");
  const factorSupport = sourceData?.factorSupport;
  if (!factorSupport || typeof factorSupport !== "object") {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      "factorSupport must be an object"
    );
  }

  const conditions = ensureArray(
    functionName,
    sourceData?.conditions,
    "conditions"
  );

  if (profiles.length !== discProfiles.length) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `profiles length (${profiles.length}) does not match dimensions.discProfiles (${discProfiles.length})`
    );
  }

  return {
    dimensions: { wind, terrain, shot, releaseAngle, discProfiles },
    profiles,
    factorSupport,
    conditions,
  };
}

const NORMALIZED_SOURCE = validateNormalizedSource(
  "validateNormalizedSource",
  recommendationsSource
);

const RELEASE_ANGLE_OPTIONS = NORMALIZED_SOURCE.dimensions.releaseAngle;

const SOURCE_DIMENSIONS = {
  wind: new Set(NORMALIZED_SOURCE.dimensions.wind),
  terrain: new Set(NORMALIZED_SOURCE.dimensions.terrain),
  shot: new Set(NORMALIZED_SOURCE.dimensions.shot),
  releaseAngle: new Set(RELEASE_ANGLE_OPTIONS),
  discProfiles: new Set(NORMALIZED_SOURCE.dimensions.discProfiles),
};

const PROFILE_BY_ID = new Map();
const PROFILES = [];
for (const profile of NORMALIZED_SOURCE.profiles) {
  const profileId = ensureString(
    "loadProfiles",
    profile?.profileId,
    "profile.profileId"
  );
  const disc = ensureString("loadProfiles", profile?.disc, `${profileId}.disc`);
  const category = ensureString(
    "loadProfiles",
    profile?.category,
    `${profileId}.category`
  );
  const baseExplanation = ensureString(
    "loadProfiles",
    profile?.baseExplanation,
    `${profileId}.baseExplanation`
  );
  const baseTips = ensureTipsArray(
    "loadProfiles",
    profile?.baseTips,
    `${profileId}.baseTips`
  );

  if (PROFILE_BY_ID.has(profileId)) {
    throwAppError(
      "loadProfiles",
      "Could not read recommendation data. Check your selected conditions.",
      `Duplicate profileId ${profileId}`
    );
  }

  PROFILE_BY_ID.set(profileId, {
    profileId,
    disc,
    category,
    baseExplanation,
    baseTips,
  });
}

for (const profileId of NORMALIZED_SOURCE.dimensions.discProfiles) {
  if (!PROFILE_BY_ID.has(profileId)) {
    throwAppError(
      "loadProfiles",
      "Could not read recommendation data. Check your selected conditions.",
      `Missing profile ${profileId}`
    );
  }

  PROFILES.push(PROFILE_BY_ID.get(profileId));
}

const FACTOR_SUPPORT = {
  wind: {},
  terrain: {},
  shot: {},
  releaseAngle: {},
};

for (const dimension of ["wind", "terrain", "shot", "releaseAngle"]) {
  const dimensionSupport = factorSupportForDimension(
    "loadFactorSupport",
    NORMALIZED_SOURCE.factorSupport,
    dimension
  );

  for (const value of NORMALIZED_SOURCE.dimensions[dimension]) {
    FACTOR_SUPPORT[dimension][value] = validateFactorSupportValue(
      "loadFactorSupport",
      dimensionSupport[value],
      `${dimension}.${value}`
    );
  }
}

const CONDITION_BY_KEY = new Map();
const CONDITIONS = [];
for (const condition of NORMALIZED_SOURCE.conditions) {
  const conditionId = ensureString(
    "loadConditions",
    condition?.id,
    "condition.id"
  );
  const wind = parseSingleSuggestedValue(
    "loadConditions",
    condition.suggestedFor,
    "wind",
    conditionId
  );
  const terrain = parseSingleSuggestedValue(
    "loadConditions",
    condition.suggestedFor,
    "terrain",
    conditionId
  );
  const shot = parseSingleSuggestedValue(
    "loadConditions",
    condition.suggestedFor,
    "shot",
    conditionId
  );
  const releaseAngle = parseSingleSuggestedValue(
    "loadConditions",
    condition.suggestedFor,
    "releaseAngle",
    conditionId
  );

  validateDimensionValue("loadConditions", "wind", wind);
  validateDimensionValue("loadConditions", "terrain", terrain);
  validateDimensionValue("loadConditions", "shot", shot);
  validateDimensionValue("loadConditions", "releaseAngle", releaseAngle);

  const recommendation = condition?.recommendation;
  if (!recommendation || typeof recommendation !== "object") {
    throwAppError(
      "loadConditions",
      "Could not read recommendation data. Check your selected conditions.",
      `${conditionId} recommendation must be an object`
    );
  }

  const normalizedRecommendation = {
    disc: ensureString(
      "loadConditions",
      recommendation.disc,
      `${conditionId}.recommendation.disc`
    ),
    category: ensureString(
      "loadConditions",
      recommendation.category,
      `${conditionId}.recommendation.category`
    ),
    angle: recommendation.angle || "",
    aimPoint: recommendation.aimPoint || "",
    summary: recommendation.summary || "",
    tips: ensureTipsArray(
      "loadConditions",
      recommendation.tips || [],
      `${conditionId}.recommendation.tips`
    ),
  };

  const key = buildConditionKey({ wind, terrain, shot, releaseAngle });
  if (CONDITION_BY_KEY.has(key)) {
    throwAppError(
      "loadConditions",
      "Could not read recommendation data. Check your selected conditions.",
      `Duplicate condition key ${key}`
    );
  }

  const normalizedCondition = {
    id: conditionId,
    wind,
    terrain,
    shot,
    releaseAngle,
    recommendation: normalizedRecommendation,
  };

  CONDITION_BY_KEY.set(key, normalizedCondition);
  CONDITIONS.push(normalizedCondition);
}

for (const wind of NORMALIZED_SOURCE.dimensions.wind) {
  for (const terrain of NORMALIZED_SOURCE.dimensions.terrain) {
    for (const shot of NORMALIZED_SOURCE.dimensions.shot) {
      for (const releaseAngle of NORMALIZED_SOURCE.dimensions.releaseAngle) {
        const key = buildConditionKey({ wind, terrain, shot, releaseAngle });
        if (!CONDITION_BY_KEY.has(key)) {
          throwAppError(
            "loadConditions",
            "Could not read recommendation data. Check your selected conditions.",
            `Missing condition for ${key}`
          );
        }
      }
    }
  }
}

export const referenceMeta = {
  windKeys: WIND_CONFIG.map((item) => item.id),
  terrainKeys: TERRAIN_CONFIG.map((item) => item.id),
  shotKeys: SHOT_CONFIG.map((item) => item.id),
  releaseAngles: RELEASE_ANGLE_OPTIONS,
  discProfiles: NORMALIZED_SOURCE.dimensions.discProfiles,
};

const WIND_ORDER = Object.fromEntries(
  WIND_DIRECTIONS.map((item, index) => [item.id, index])
);

const TERRAIN_ORDER = Object.fromEntries(
  TERRAIN_TYPES.map((item, index) => [item.id, index])
);

const SHOT_ORDER = Object.fromEntries(
  SHOT_SHAPES.map((item, index) => [item.id, index])
);

const RELEASE_ANGLE_ORDER = Object.fromEntries(
  RELEASE_ANGLE_OPTIONS.map((value, index) => [value, index])
);

function factorSupportForDimension(functionName, factorSupport, dimension) {
  const value = factorSupport?.[dimension];
  if (!value || typeof value !== "object") {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `factorSupport.${dimension} must be an object`
    );
  }
  return value;
}

function validateDimensionValue(functionName, dimension, sourceValue) {
  if (!SOURCE_DIMENSIONS[dimension].has(sourceValue)) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Unknown ${dimension} value: ${sourceValue}`
    );
  }
}

function toSourceValue(functionName, dimension, selectedId, idToSourceMap) {
  const sourceValue = idToSourceMap[selectedId];
  if (!sourceValue) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Unknown ${dimension} id: ${selectedId}`
    );
  }

  validateDimensionValue(functionName, dimension, sourceValue);
  return sourceValue;
}

function toSourceReleaseAngle(functionName, releaseAngle) {
  const normalizedReleaseAngle = releaseAngle || "flat";
  validateDimensionValue(functionName, "releaseAngle", normalizedReleaseAngle);
  return normalizedReleaseAngle;
}

function toSourceWindId(selectedWindId, perspective) {
  return toSourceDirectionalId(selectedWindId, MIRRORED_WIND_ID, perspective);
}

function toSourceShotId(selectedShotId, perspective) {
  return toSourceDirectionalId(selectedShotId, MIRRORED_SHOT_ID, perspective);
}

function toDisplayWindId(sourceWindId, perspective) {
  return toDisplayDirectionalId(sourceWindId, MIRRORED_WIND_ID, perspective);
}

function toDisplayShotId(sourceShotId, perspective) {
  return toDisplayDirectionalId(sourceShotId, MIRRORED_SHOT_ID, perspective);
}

function toDisplayFactorValue(dimension, sourceValue, perspective) {
  if (dimension === "wind") {
    return toDisplayWindId(sourceValue, perspective);
  }
  if (dimension === "shot") {
    return toDisplayShotId(sourceValue, perspective);
  }
  return sourceValue;
}

function toValueOrderMapForPerspective(dimension, perspective) {
  if (!shouldMirrorPerspective(perspective)) {
    return dimension === "wind"
      ? WIND_ORDER
      : dimension === "terrain"
      ? TERRAIN_ORDER
      : dimension === "shot"
      ? SHOT_ORDER
      : RELEASE_ANGLE_ORDER;
  }

  if (dimension === "wind") {
    return Object.fromEntries(
      WIND_DIRECTIONS.map((item, index) => [toDisplayWindId(item.id, perspective), index])
    );
  }

  if (dimension === "shot") {
    return Object.fromEntries(
      SHOT_SHAPES.map((item, index) => [toDisplayShotId(item.id, perspective), index])
    );
  }

  return dimension === "terrain" ? TERRAIN_ORDER : RELEASE_ANGLE_ORDER;
}

function buildConditionKey({ wind, terrain, shot, releaseAngle }) {
  return `${wind}|${terrain}|${shot}|${releaseAngle}`;
}

function normalizeRecommendation(shotId, condition, perspective) {
  const recommendationTips = condition.recommendation.tips.map((tip) =>
    mirrorTextForPerspective(tip, perspective)
  );

  return {
    shotId,
    disc: condition.recommendation.disc,
    category: condition.recommendation.category,
    angle: condition.recommendation.angle,
    summary: mirrorTextForPerspective(condition.recommendation.summary, perspective),
    aimNote: mirrorTextForPerspective(condition.recommendation.aimPoint, perspective),
    tips: recommendationTips,
    tip: recommendationTips[0] || "",
    confidence: "best",
  };
}

function sortValues(values, orderMap) {
  return values.slice().sort((a, b) => {
    const rankA = orderMap[a] ?? 99;
    const rankB = orderMap[b] ?? 99;
    return rankA - rankB;
  });
}

function createMatchedFactorSets() {
  return {
    wind: new Set(),
    terrain: new Set(),
    shot: new Set(),
    releaseAngle: new Set(),
  };
}

function collectMatchedFactorSets(conditions) {
  const matched = createMatchedFactorSets();
  for (const condition of conditions) {
    matched.wind.add(condition.wind);
    matched.terrain.add(condition.terrain);
    matched.shot.add(condition.shot);
    matched.releaseAngle.add(condition.releaseAngle);
  }
  return matched;
}

function toFactorExplanations(dimension, matchedValues, perspective) {
  const valueOrder = toValueOrderMapForPerspective(dimension, perspective);

  const orderedValues = sortValues(Array.from(matchedValues), valueOrder);
  const byText = new Map();

  for (const value of orderedValues) {
    const support = FACTOR_SUPPORT[dimension][value];
    if (!support) {
      throwAppError(
        "toFactorExplanations",
        "Could not read recommendation data. Check your selected conditions.",
        `Missing factor support for ${dimension}.${value}`
      );
    }

    const existing = byText.get(support.explanation);
    const displayValue = toDisplayFactorValue(dimension, value, perspective);
    if (!existing) {
      byText.set(support.explanation, {
        text: mirrorTextForPerspective(support.explanation, perspective),
        matchedValues: [displayValue],
      });
      continue;
    }

    existing.matchedValues.push(displayValue);
  }

  return Array.from(byText.values()).map((entry) => ({
    ...entry,
    matchedValues: sortValues(entry.matchedValues, valueOrder),
  }));
}

function getMatchedConditions(filter) {
  return CONDITIONS.filter((condition) => {
    if (filter.wind && condition.wind !== filter.wind) {
      return false;
    }
    if (filter.terrain && condition.terrain !== filter.terrain) {
      return false;
    }
    if (filter.shot && condition.shot !== filter.shot) {
      return false;
    }
    if (filter.releaseAngle && condition.releaseAngle !== filter.releaseAngle) {
      return false;
    }
    return true;
  });
}

function toFacetFilter(functionName, discType, stability) {
  if (discType && !Object.prototype.hasOwnProperty.call(CATEGORY_ORDER, discType)) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Unknown discType filter: ${discType}`
    );
  }

  if (stability && !Object.prototype.hasOwnProperty.call(DISC_ORDER, stability)) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Unknown stability filter: ${stability}`
    );
  }

  return {
    discType: discType || null,
    stability: stability || null,
  };
}

function toDimensionFilter(functionName, params, perspective) {
  return {
    wind: params.windId
      ? toSourceValue(
          functionName,
          "wind",
          toSourceWindId(params.windId, perspective),
          WIND_ID_TO_SOURCE
        )
      : null,
    terrain: params.terrainId
      ? toSourceValue(
          functionName,
          "terrain",
          params.terrainId,
          TERRAIN_ID_TO_SOURCE
        )
      : null,
    shot: params.shotId
      ? toSourceValue(
          functionName,
          "shot",
          toSourceShotId(params.shotId, perspective),
          SHOT_ID_TO_SOURCE
        )
      : null,
    releaseAngle: params.releaseAngle
      ? toSourceReleaseAngle(functionName, params.releaseAngle)
      : null,
  };
}

function toSituationalSummaries(matchedConditions, perspective) {
  const windOrderByPerspective = toValueOrderMapForPerspective("wind", perspective);
  const shotOrderByPerspective = toValueOrderMapForPerspective("shot", perspective);
  const summaryMap = new Map();

  for (const condition of matchedConditions) {
    const sourceSummaryText = ensureString(
      "toSituationalSummaries",
      condition.recommendation.summary,
      `${condition.id}.recommendation.summary`
    );
    const summaryText = mirrorTextForPerspective(sourceSummaryText, perspective);

    const existing = summaryMap.get(summaryText);
    if (!existing) {
      summaryMap.set(summaryText, {
        summary: summaryText,
        conditionCount: 1,
        matchedFactors: {
          wind: new Set([toDisplayWindId(condition.wind, perspective)]),
          terrain: new Set([condition.terrain]),
          shot: new Set([toDisplayShotId(condition.shot, perspective)]),
          releaseAngle: new Set([condition.releaseAngle]),
        },
      });
      continue;
    }

    existing.conditionCount += 1;
    existing.matchedFactors.wind.add(toDisplayWindId(condition.wind, perspective));
    existing.matchedFactors.terrain.add(condition.terrain);
    existing.matchedFactors.shot.add(toDisplayShotId(condition.shot, perspective));
    existing.matchedFactors.releaseAngle.add(condition.releaseAngle);
  }

  return Array.from(summaryMap.values())
    .map((entry) => ({
      summary: entry.summary,
      conditionCount: entry.conditionCount,
      matchedFactors: {
        wind: sortValues(Array.from(entry.matchedFactors.wind), windOrderByPerspective),
        terrain: sortValues(
          Array.from(entry.matchedFactors.terrain),
          TERRAIN_ORDER
        ),
        shot: sortValues(Array.from(entry.matchedFactors.shot), shotOrderByPerspective),
        releaseAngle: sortValues(
          Array.from(entry.matchedFactors.releaseAngle),
          RELEASE_ANGLE_ORDER
        ),
      },
    }))
    .sort((a, b) => {
      if (b.conditionCount !== a.conditionCount) {
        return b.conditionCount - a.conditionCount;
      }
      return a.summary.localeCompare(b.summary);
    });
}

function toCardTips(profile, matchedFactorSets, perspective) {
  const tips = new Set(
    profile.baseTips.map((tip) => mirrorTextForPerspective(tip, perspective))
  );

  for (const dimension of ["wind", "terrain", "shot", "releaseAngle"]) {
    for (const value of matchedFactorSets[dimension]) {
      const support = FACTOR_SUPPORT[dimension][value];
      if (!support) {
        throwAppError(
          "toCardTips",
          "Could not read recommendation data. Check your selected conditions.",
          `Missing factor support for ${dimension}.${value}`
        );
      }
      tips.add(mirrorTextForPerspective(support.tip, perspective));
    }
  }

  return Array.from(tips);
}

function resolveRecommendationSelection(functionName, params) {
  const selectedPerspective = toThrowPerspective(functionName, params.perspective);
  const wind = toSourceValue(
    functionName,
    "wind",
    toSourceWindId(params.windId, selectedPerspective),
    WIND_ID_TO_SOURCE
  );
  const terrain = toSourceValue(
    functionName,
    "terrain",
    params.terrainId,
    TERRAIN_ID_TO_SOURCE
  );
  const shot = toSourceValue(
    functionName,
    "shot",
    toSourceShotId(params.shotId, selectedPerspective),
    SHOT_ID_TO_SOURCE
  );
  const selectedReleaseAngle = toSourceReleaseAngle(
    functionName,
    params.releaseAngle
  );

  return {
    selectedPerspective,
    selectedWindId: params.windId,
    selectedTerrainId: params.terrainId,
    selectedShotId: params.shotId,
    wind,
    terrain,
    shot,
    releaseAngle: selectedReleaseAngle,
  };
}

function findCondition(selection) {
  const key = buildConditionKey({
    wind: selection.wind,
    terrain: selection.terrain,
    shot: selection.shot,
    releaseAngle: selection.releaseAngle,
  });

  return CONDITION_BY_KEY.get(key) || null;
}

function toShotFamily(functionName, sourceShot) {
  if (sourceShot === "distance") {
    return "max_distance";
  }
  if (
    sourceShot === "long_left" ||
    sourceShot === "long_right" ||
    sourceShot === "s_curve"
  ) {
    return "long_shape";
  }
  if (sourceShot === "straight") {
    return "straight";
  }
  if (sourceShot === "short_left" || sourceShot === "short_right") {
    return "short_shape";
  }
  if (sourceShot === "putting") {
    return "putting";
  }

  throwAppError(
    functionName,
    "Could not read recommendation data. Check your selected conditions.",
    `Unsupported shot for category comparison: ${sourceShot}`
  );
}

function toWindPattern(functionName, sourceWind) {
  if (sourceWind === "no_wind") {
    return "calm";
  }
  if (sourceWind === "headwind") {
    return "headwind";
  }
  if (sourceWind === "tailwind") {
    return "tailwind";
  }
  if (sourceWind === "left_to_right" || sourceWind === "right_to_left") {
    return "crosswind";
  }
  if (sourceWind.startsWith("headwind_")) {
    return "headwind_cross";
  }
  if (sourceWind.startsWith("tailwind_")) {
    return "tailwind_cross";
  }

  throwAppError(
    functionName,
    "Could not read recommendation data. Check your selected conditions.",
    `Unsupported wind for category comparison: ${sourceWind}`
  );
}

function toDisplayShotLabel(functionName, shotId, perspective) {
  const shotOption = SHOT_CONFIG_BY_ID[shotId];
  if (!shotOption) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Unknown shot id for comparison label: ${shotId}`
    );
  }

  return getDirectionalOptionByPerspective(
    shotOption,
    SHOT_CONFIG_BY_ID,
    MIRRORED_SHOT_ID,
    perspective
  ).label;
}

function toDisplayWindLabel(functionName, windId, perspective) {
  const windOption = WIND_CONFIG_BY_ID[windId];
  if (!windOption) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Unknown wind id for comparison label: ${windId}`
    );
  }

  return getDirectionalOptionByPerspective(
    windOption,
    WIND_CONFIG_BY_ID,
    MIRRORED_WIND_ID,
    perspective
  ).label;
}

function toTerrainLabel(functionName, terrainId) {
  const terrainOption = TERRAIN_CONFIG_BY_ID[terrainId];
  if (!terrainOption) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Unknown terrain id for comparison label: ${terrainId}`
    );
  }
  return terrainOption.label;
}

function toShotUseGuidance(category, shotFamily, shotLabel) {
  if (category === "driver") {
    if (shotFamily === "max_distance") {
      return `Use a driver for ${shotLabel.toLowerCase()} lines that need maximum carry.`;
    }
    if (shotFamily === "long_shape") {
      return `Use a driver for ${shotLabel.toLowerCase()} lines that need long carry before shape.`;
    }
    if (shotFamily === "straight") {
      return "Use a driver when this straight line is long enough to demand speed.";
    }
    if (shotFamily === "short_shape") {
      return `Use a driver only if this ${shotLabel.toLowerCase()} line still needs speed through wind.`;
    }
    return "Use a driver only for long wind-fighting putts outside normal putting range.";
  }

  if (category === "mid") {
    if (shotFamily === "max_distance") {
      return "Use a mid when you want distance with tighter landing control than a driver.";
    }
    if (shotFamily === "long_shape") {
      return `Use a mid for ${shotLabel.toLowerCase()} lines when control matters more than pure carry.`;
    }
    if (shotFamily === "straight") {
      return "Use a mid for an accuracy-first straight line.";
    }
    if (shotFamily === "short_shape") {
      return `Use a mid for controlled ${shotLabel.toLowerCase()} approaches with predictable finish.`;
    }
    return "Use a mid for long approaches outside normal putting distance.";
  }

  if (shotFamily === "max_distance") {
    return "Use a putter only when touch and landing control matter more than carry.";
  }
  if (shotFamily === "long_shape") {
    return `Use a putter only if this ${shotLabel.toLowerCase()} line is touch-first and distance-limited.`;
  }
  if (shotFamily === "straight") {
    return "Use a putter for touch-first straight lines with a soft landing.";
  }
  if (shotFamily === "short_shape") {
    return `Use a putter for short ${shotLabel.toLowerCase()} touch lines with minimal ground play.`;
  }
  return "Use a putter as the default for committed putts and short touch finishes.";
}

function toWindGuidance(category, windPattern, windLabel) {
  const lowercaseWind = windLabel.toLowerCase();
  if (windPattern === "calm") {
    return `In ${lowercaseWind}, control is easier to repeat.`;
  }
  if (windPattern === "headwind" || windPattern === "headwind_cross") {
    if (category === "driver") {
      return `In ${lowercaseWind}, driver speed helps hold line.`;
    }
    if (category === "mid") {
      return `In ${lowercaseWind}, throw firmly to keep mids from drifting.`;
    }
    return `In ${lowercaseWind}, keep putters low and committed.`;
  }
  if (windPattern === "tailwind" || windPattern === "tailwind_cross") {
    if (category === "driver") {
      return `In ${lowercaseWind}, manage power because carry can spike.`;
    }
    if (category === "mid") {
      return `In ${lowercaseWind}, mids usually stay controllable with clean glide.`;
    }
    return `In ${lowercaseWind}, commit to pace so glide does not drop early.`;
  }
  if (category === "driver") {
    return `In ${lowercaseWind}, expect larger lateral movement at driver speed.`;
  }
  if (category === "mid") {
    return `In ${lowercaseWind}, mids usually offer cleaner lateral control.`;
  }
  return `In ${lowercaseWind}, putters need a firm release to resist drift.`;
}

function toTerrainGuidance(category, terrainLabel) {
  const lowercaseTerrain = terrainLabel.toLowerCase();
  if (lowercaseTerrain === "uphill") {
    if (category === "driver") {
      return "Uphill rewards the extra speed.";
    }
    if (category === "mid") {
      return "Uphill may require a firmer commit.";
    }
    return "Uphill can make putters stall early.";
  }
  if (lowercaseTerrain === "downhill") {
    if (category === "driver") {
      return "Downhill can add big carry and skip.";
    }
    if (category === "mid") {
      return "Downhill pairs well with controlled glide.";
    }
    return "Downhill favors soft landings.";
  }
  if (category === "driver") {
    return "Flat ground keeps the full-flight profile predictable.";
  }
  if (category === "mid") {
    return "Flat ground keeps the control profile predictable.";
  }
  return "Flat ground keeps touch and landing predictable.";
}

function toTradeoffGuidance(category, shotFamily, windPattern, terrain) {
  let text = "";
  if (category === "driver") {
    text = "Highest carry potential, but the biggest miss distance.";
    if (shotFamily === "putting") {
      return `${text} Easy to sail long past the basket.`;
    }
    if (terrain === "downhill") {
      return `${text} Downhill misses can skip far past target.`;
    }
    return text;
  }

  if (category === "mid") {
    text = "Best control-to-distance balance, but less peak carry than a driver.";
    if (shotFamily === "max_distance") {
      return `${text} It may finish short when full distance is required.`;
    }
    return text;
  }

  text = "Best touch and landing control, but limited carry on longer lines.";
  if (shotFamily === "max_distance" || shotFamily === "long_shape") {
    return `${text} It can run out of speed before the full line develops.`;
  }
  if (windPattern === "headwind" || windPattern === "headwind_cross") {
    return `${text} Headwind can move it unless thrown firmly.`;
  }
  return text;
}

function toCategoryComparisonScores(
  functionName,
  sourceShot,
  sourceWind,
  sourceTerrain,
  primaryCategory
) {
  const shotFamily = toShotFamily(functionName, sourceShot);
  const windPattern = toWindPattern(functionName, sourceWind);
  const shotScores = SHOT_FIT_SCORES[shotFamily];
  const windScores = WIND_FIT_SCORES[windPattern];
  const terrainScores = TERRAIN_FIT_SCORES[sourceTerrain];

  if (!shotScores || !windScores || !terrainScores) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Missing comparison scoring map for shot=${sourceShot}, wind=${sourceWind}, terrain=${sourceTerrain}`
    );
  }

  if (!Object.prototype.hasOwnProperty.call(CATEGORY_ORDER, primaryCategory)) {
    throwAppError(
      functionName,
      "Could not read recommendation data. Check your selected conditions.",
      `Unknown primary category for comparison: ${primaryCategory}`
    );
  }

  const byCategory = {};
  for (const category of CATEGORY_COMPARISON_ORDER) {
    byCategory[category] =
      shotScores[category] +
      windScores[category] +
      terrainScores[category] +
      (category === primaryCategory ? PRIMARY_CATEGORY_ANCHOR_BONUS : 0);
  }

  return {
    shotFamily,
    windPattern,
    byCategory,
  };
}

function toCategoryComparisons(functionName, selection, primaryRecommendation) {
  const scores = toCategoryComparisonScores(
    functionName,
    selection.shot,
    selection.wind,
    selection.terrain,
    primaryRecommendation.category
  );
  const shotLabel = toDisplayShotLabel(
    functionName,
    selection.selectedShotId,
    selection.selectedPerspective
  );
  const windLabel = toDisplayWindLabel(
    functionName,
    selection.selectedWindId,
    selection.selectedPerspective
  );
  const terrainLabel = toTerrainLabel(functionName, selection.selectedTerrainId);

  return CATEGORY_COMPARISON_ORDER.map((category) => ({
    category,
    disc: primaryRecommendation.disc,
    isPrimaryMatch: category === primaryRecommendation.category,
    fitScore: scores.byCategory[category],
    whenToUse: `${toShotUseGuidance(category, scores.shotFamily, shotLabel)} ${toWindGuidance(
      category,
      scores.windPattern,
      windLabel
    )} ${toTerrainGuidance(category, terrainLabel)}`,
    tradeoff: toTradeoffGuidance(
      category,
      scores.shotFamily,
      scores.windPattern,
      selection.terrain
    ),
  }));
}

/**
 * Get a single suggester recommendation for one wind + terrain + shot combination.
 *
 * @param {object} params Query parameters.
 * @param {string} params.windId Selected wind id from WIND_DIRECTIONS.
 * @param {string} params.terrainId Selected terrain id from TERRAIN_TYPES.
 * @param {string} params.shotId Selected shot id from SHOT_SHAPES.
 * @param {string} [params.releaseAngle] Optional release angle. Defaults to 'flat'.
 * @param {string} [params.perspective='rhbh_lhfh'] Throw perspective id.
 * @returns {object | null} Normalized suggester recommendation or null if unavailable.
 */
export function getRecommendation({
  windId,
  terrainId,
  shotId,
  releaseAngle,
  perspective = DEFAULT_THROW_PERSPECTIVE,
}) {
  const functionName = "getRecommendation";
  const selection = resolveRecommendationSelection(functionName, {
    windId,
    terrainId,
    shotId,
    releaseAngle,
    perspective,
  });
  const condition = findCondition(selection);
  if (!condition) {
    return null;
  }

  return normalizeRecommendation(
    selection.selectedShotId,
    condition,
    selection.selectedPerspective
  );
}

/**
 * Get a suggester result package with the legacy primary recommendation and
 * a driver/mid/putter comparison for the same selected conditions.
 *
 * @param {object} params Query parameters.
 * @param {string} params.windId Selected wind id from WIND_DIRECTIONS.
 * @param {string} params.terrainId Selected terrain id from TERRAIN_TYPES.
 * @param {string} params.shotId Selected shot id from SHOT_SHAPES.
 * @param {string} [params.releaseAngle] Optional release angle. Defaults to 'flat'.
 * @param {string} [params.perspective='rhbh_lhfh'] Throw perspective id.
 * @returns {{primaryRecommendation: object, categoryComparisons: object[]} | null}
 *   Comparison package or null when the combination is unavailable.
 */
export function getCategoryComparisonForCondition({
  windId,
  terrainId,
  shotId,
  releaseAngle,
  perspective = DEFAULT_THROW_PERSPECTIVE,
}) {
  const functionName = "getCategoryComparisonForCondition";
  const selection = resolveRecommendationSelection(functionName, {
    windId,
    terrainId,
    shotId,
    releaseAngle,
    perspective,
  });
  const condition = findCondition(selection);
  if (!condition) {
    return null;
  }

  const primaryRecommendation = normalizeRecommendation(
    selection.selectedShotId,
    condition,
    selection.selectedPerspective
  );

  return {
    primaryRecommendation,
    categoryComparisons: toCategoryComparisons(
      functionName,
      selection,
      primaryRecommendation
    ),
  };
}

/**
 * Get all suggester recommendations for one wind + terrain combination.
 *
 * @param {object} params Query parameters.
 * @param {string} params.windId Selected wind id from WIND_DIRECTIONS.
 * @param {string} params.terrainId Selected terrain id from TERRAIN_TYPES.
 * @param {string} [params.releaseAngle] Optional release angle. Defaults to 'flat'.
 * @param {string} [params.perspective='rhbh_lhfh'] Throw perspective id.
 * @returns {object[]} Ordered suggester recommendations.
 */
export function getRecommendationsForCondition({
  windId,
  terrainId,
  releaseAngle,
  perspective = DEFAULT_THROW_PERSPECTIVE,
}) {
  const selectedPerspective = toThrowPerspective(
    "getRecommendationsForCondition",
    perspective
  );
  return getShotShapes(selectedPerspective)
    .map((shot) =>
    getRecommendation({
      windId,
      terrainId,
      shotId: shot.id,
      releaseAngle,
      perspective: selectedPerspective,
    })
  )
    .filter(Boolean);
}

/**
 * Get reference cards assembled from normalized profiles, factor support, and matched conditions.
 *
 * @param {object} params Query parameters.
 * @param {string | null} [params.windId=null] Optional wind id from WIND_DIRECTIONS.
 * @param {string | null} [params.terrainId=null] Optional terrain id from TERRAIN_TYPES.
 * @param {string | null} [params.shotId=null] Optional shot shape id from SHOT_SHAPES.
 * @param {string | null} [params.releaseAngle=null] Optional release angle: 'hyzer' | 'flat' | 'anhyzer'.
 * @param {string | null} [params.discType=null] Optional disc type/category: 'driver' | 'mid' | 'putter'.
 * @param {string | null} [params.stability=null] Optional stability: 'understable' | 'stable' | 'overstable'.
 * @param {string} [params.perspective='rhbh_lhfh'] Throw perspective id.
 * @returns {object[]} Reference cards for the selected conditions.
 */
export function getReferenceCardsForCondition({
  windId = null,
  terrainId = null,
  shotId = null,
  releaseAngle = null,
  discType = null,
  stability = null,
  perspective = DEFAULT_THROW_PERSPECTIVE,
}) {
  const functionName = "getReferenceCardsForCondition";
  const selectedPerspective = toThrowPerspective(functionName, perspective);
  const selectedFilter = toDimensionFilter(functionName, {
    windId,
    terrainId,
    shotId,
    releaseAngle,
  }, selectedPerspective);
  const facetFilter = toFacetFilter(functionName, discType, stability);
  const matchedConditions = getMatchedConditions(selectedFilter);

  if (matchedConditions.length === 0) {
    return [];
  }

  const matchedFactorSets = collectMatchedFactorSets(matchedConditions);

  const cards = PROFILES.filter((profile) => {
    if (facetFilter.discType && profile.category !== facetFilter.discType) {
      return false;
    }

    if (facetFilter.stability && profile.disc !== facetFilter.stability) {
      return false;
    }

    return true;
  }).map((profile) => ({
    profileId: profile.profileId,
    disc: profile.disc,
    category: profile.category,
    baseExplanation: mirrorTextForPerspective(
      profile.baseExplanation,
      selectedPerspective
    ),
    factorExplanations: {
      wind: toFactorExplanations(
        "wind",
        matchedFactorSets.wind,
        selectedPerspective
      ),
      terrain: toFactorExplanations(
        "terrain",
        matchedFactorSets.terrain,
        selectedPerspective
      ),
      shot: toFactorExplanations(
        "shot",
        matchedFactorSets.shot,
        selectedPerspective
      ),
      releaseAngle: toFactorExplanations(
        "releaseAngle",
        matchedFactorSets.releaseAngle,
        selectedPerspective
      ),
    },
    tips: toCardTips(profile, matchedFactorSets, selectedPerspective),
    situationalSummaries: toSituationalSummaries(
      matchedConditions,
      selectedPerspective
    ),
  }));

  cards.sort((a, b) => {
    const categoryDelta =
      (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);

    if (categoryDelta !== 0) {
      return categoryDelta;
    }

    return (DISC_ORDER[a.disc] ?? 99) - (DISC_ORDER[b.disc] ?? 99);
  });

  return cards;
}

/**
 * Internal helper utilities exposed for unit testing.
 */
export const __referenceInternals = {
  mirrorDirectionalText,
  toSourceWindId,
  toSourceShotId,
  toDisplayWindId,
  toDisplayShotId,
  validateNormalizedSource,
};
