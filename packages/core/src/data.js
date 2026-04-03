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

function throwAppError(functionName, userMessage, debugContext) {
  const err = new AppError(userMessage, debugContext);
  console.error(`[${functionName}]`, err);
  throw err;
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

function buildConditionKey({ wind, terrain, shot, releaseAngle }) {
  return `${wind}|${terrain}|${shot}|${releaseAngle}`;
}

function normalizeRecommendation(shotId, condition) {
  return {
    shotId,
    disc: condition.recommendation.disc,
    category: condition.recommendation.category,
    angle: condition.recommendation.angle,
    summary: condition.recommendation.summary,
    aimNote: condition.recommendation.aimPoint,
    tips: condition.recommendation.tips,
    tip: condition.recommendation.tips[0] || "",
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

function toFactorExplanations(dimension, matchedValues) {
  const valueOrder =
    dimension === "wind"
      ? WIND_ORDER
      : dimension === "terrain"
      ? TERRAIN_ORDER
      : dimension === "shot"
      ? SHOT_ORDER
      : RELEASE_ANGLE_ORDER;

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
    if (!existing) {
      byText.set(support.explanation, {
        text: support.explanation,
        matchedValues: [value],
      });
      continue;
    }

    existing.matchedValues.push(value);
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

function toDimensionFilter(functionName, params) {
  return {
    wind: params.windId
      ? toSourceValue(functionName, "wind", params.windId, WIND_ID_TO_SOURCE)
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
      ? toSourceValue(functionName, "shot", params.shotId, SHOT_ID_TO_SOURCE)
      : null,
    releaseAngle: params.releaseAngle
      ? toSourceReleaseAngle(functionName, params.releaseAngle)
      : null,
  };
}

function toSituationalSummaries(matchedConditions) {
  const summaryMap = new Map();

  for (const condition of matchedConditions) {
    const summaryText = ensureString(
      "toSituationalSummaries",
      condition.recommendation.summary,
      `${condition.id}.recommendation.summary`
    );

    const existing = summaryMap.get(summaryText);
    if (!existing) {
      summaryMap.set(summaryText, {
        summary: summaryText,
        conditionCount: 1,
        matchedFactors: {
          wind: new Set([condition.wind]),
          terrain: new Set([condition.terrain]),
          shot: new Set([condition.shot]),
          releaseAngle: new Set([condition.releaseAngle]),
        },
      });
      continue;
    }

    existing.conditionCount += 1;
    existing.matchedFactors.wind.add(condition.wind);
    existing.matchedFactors.terrain.add(condition.terrain);
    existing.matchedFactors.shot.add(condition.shot);
    existing.matchedFactors.releaseAngle.add(condition.releaseAngle);
  }

  return Array.from(summaryMap.values())
    .map((entry) => ({
      summary: entry.summary,
      conditionCount: entry.conditionCount,
      matchedFactors: {
        wind: sortValues(Array.from(entry.matchedFactors.wind), WIND_ORDER),
        terrain: sortValues(
          Array.from(entry.matchedFactors.terrain),
          TERRAIN_ORDER
        ),
        shot: sortValues(Array.from(entry.matchedFactors.shot), SHOT_ORDER),
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

function toCardTips(profile, matchedFactorSets) {
  const tips = new Set(profile.baseTips);

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
      tips.add(support.tip);
    }
  }

  return Array.from(tips);
}

/**
 * Get a single suggester recommendation for one wind + terrain + shot combination.
 *
 * @param {object} params Query parameters.
 * @param {string} params.windId Selected wind id from WIND_DIRECTIONS.
 * @param {string} params.terrainId Selected terrain id from TERRAIN_TYPES.
 * @param {string} params.shotId Selected shot id from SHOT_SHAPES.
 * @param {string} [params.releaseAngle] Optional release angle. Defaults to 'flat'.
 * @returns {object | null} Normalized suggester recommendation or null if unavailable.
 */
export function getRecommendation({
  windId,
  terrainId,
  shotId,
  releaseAngle,
}) {
  const functionName = "getRecommendation";
  const wind = toSourceValue(functionName, "wind", windId, WIND_ID_TO_SOURCE);
  const terrain = toSourceValue(
    functionName,
    "terrain",
    terrainId,
    TERRAIN_ID_TO_SOURCE
  );
  const shot = toSourceValue(functionName, "shot", shotId, SHOT_ID_TO_SOURCE);
  const selectedReleaseAngle = toSourceReleaseAngle(functionName, releaseAngle);

  const key = buildConditionKey({
    wind,
    terrain,
    shot,
    releaseAngle: selectedReleaseAngle,
  });

  const condition = CONDITION_BY_KEY.get(key);
  if (!condition) {
    return null;
  }

  return normalizeRecommendation(shotId, condition);
}

/**
 * Get all suggester recommendations for one wind + terrain combination.
 *
 * @param {object} params Query parameters.
 * @param {string} params.windId Selected wind id from WIND_DIRECTIONS.
 * @param {string} params.terrainId Selected terrain id from TERRAIN_TYPES.
 * @param {string} [params.releaseAngle] Optional release angle. Defaults to 'flat'.
 * @returns {object[]} Ordered suggester recommendations.
 */
export function getRecommendationsForCondition({
  windId,
  terrainId,
  releaseAngle,
}) {
  return SHOT_SHAPES.map((shot) =>
    getRecommendation({
      windId,
      terrainId,
      shotId: shot.id,
      releaseAngle,
    })
  ).filter(Boolean);
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
 * @returns {object[]} Reference cards for the selected conditions.
 */
export function getReferenceCardsForCondition({
  windId = null,
  terrainId = null,
  shotId = null,
  releaseAngle = null,
  discType = null,
  stability = null,
}) {
  const functionName = "getReferenceCardsForCondition";
  const selectedFilter = toDimensionFilter(functionName, {
    windId,
    terrainId,
    shotId,
    releaseAngle,
  });
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
    baseExplanation: profile.baseExplanation,
    factorExplanations: {
      wind: toFactorExplanations("wind", matchedFactorSets.wind),
      terrain: toFactorExplanations("terrain", matchedFactorSets.terrain),
      shot: toFactorExplanations("shot", matchedFactorSets.shot),
      releaseAngle: toFactorExplanations(
        "releaseAngle",
        matchedFactorSets.releaseAngle
      ),
    },
    tips: toCardTips(profile, matchedFactorSets),
    situationalSummaries: toSituationalSummaries(matchedConditions),
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
  validateNormalizedSource,
};
