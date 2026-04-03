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

const WIND_ID_TO_SOURCE = Object.fromEntries(
  WIND_CONFIG.map((entry) => [entry.id, entry.sourceKey])
);

const TERRAIN_ID_TO_SOURCE = Object.fromEntries(
  TERRAIN_CONFIG.map((entry) => [entry.id, entry.sourceKey])
);

const SHOT_ID_TO_SOURCE = Object.fromEntries(
  SHOT_CONFIG.map((entry) => [entry.id, entry.sourceKey])
);

const RELEASE_ANGLE_OPTIONS = recommendationsSource?.dimensions?.releaseAngle || [
  "hyzer",
  "flat",
  "anhyzer",
];

const SOURCE_DIMENSIONS = {
  wind: new Set(recommendationsSource?.dimensions?.wind || []),
  terrain: new Set(recommendationsSource?.dimensions?.terrain || []),
  shot: new Set(recommendationsSource?.dimensions?.shot || []),
  releaseAngle: new Set(RELEASE_ANGLE_OPTIONS),
  discProfiles: new Set(recommendationsSource?.dimensions?.discProfiles || []),
};

const ENTRIES = Array.isArray(recommendationsSource?.entries)
  ? recommendationsSource.entries
  : [];

const ENTRIES_WITH_INDEX = ENTRIES.map((entry, index) => ({ entry, index }));

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
export const referenceMeta = {
  windKeys: WIND_CONFIG.map((item) => item.id),
  terrainKeys: TERRAIN_CONFIG.map((item) => item.id),
  shotKeys: SHOT_CONFIG.map((item) => item.id),
  releaseAngles: RELEASE_ANGLE_OPTIONS,
  discProfiles: Array.from(SOURCE_DIMENSIONS.discProfiles),
};

function throwAppError(functionName, userMessage, debugContext) {
  const err = new AppError(userMessage, debugContext);
  console.error(`[${functionName}]`, err);
  throw err;
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

function getDimensionMatchStrength(matcherValue, selectedValue) {
  if (matcherValue === "*") {
    return 1;
  }

  if (!Array.isArray(matcherValue) || matcherValue.length === 0) {
    return 0;
  }

  if (!matcherValue.includes(selectedValue)) {
    return 0;
  }

  if (matcherValue.length === 1) {
    return 3;
  }

  return 2;
}

function getSpecificityScore(entry, selected) {
  const suggestedFor = entry?.suggestedFor || {};
  const windScore = getDimensionMatchStrength(suggestedFor.wind, selected.wind);
  const terrainScore = getDimensionMatchStrength(
    suggestedFor.terrain,
    selected.terrain
  );
  const shotScore = getDimensionMatchStrength(suggestedFor.shot, selected.shot);
  const releaseAngleScore = getDimensionMatchStrength(
    suggestedFor.releaseAngle,
    selected.releaseAngle
  );

  if (
    windScore === 0 ||
    terrainScore === 0 ||
    shotScore === 0 ||
    releaseAngleScore === 0
  ) {
    return null;
  }

  // Weighted lexicographic score where single-value match > multi-value set > wildcard.
  return (
    windScore * 1000 +
    terrainScore * 100 +
    shotScore * 10 +
    releaseAngleScore
  );
}

function selectBestEntry(functionName, selected, entriesWithIndex) {
  let best = null;
  let ties = [];

  for (const item of entriesWithIndex) {
    const specificityScore = getSpecificityScore(item.entry, selected);
    if (specificityScore === null) {
      continue;
    }

    const priority = Number(item.entry?.priority || 0);

    if (
      !best ||
      specificityScore > best.specificityScore ||
      (specificityScore === best.specificityScore && priority > best.priority)
    ) {
      best = {
        ...item,
        specificityScore,
        priority,
      };
      ties = [best];
      continue;
    }

    if (
      specificityScore === best.specificityScore &&
      priority === best.priority
    ) {
      ties.push({
        ...item,
        specificityScore,
        priority,
      });
    }
  }

  if (ties.length > 1) {
    throwAppError(
      functionName,
      "Could not resolve a recommendation for this condition.",
      `Ambiguous entries with same specificity and priority: ${ties
        .map((item) => item.entry.id)
        .join(", ")}`
    );
  }

  return best;
}

function normalizeRecommendation(shotId, entry) {
  const recommendation = entry?.recommendation;

  if (!recommendation?.disc || !recommendation?.category) {
    return null;
  }

  const tips = Array.isArray(recommendation.tips) ? recommendation.tips : [];

  return {
    shotId,
    disc: recommendation.disc,
    category: recommendation.category,
    angle: recommendation.angle || "",
    summary: recommendation.summary || "",
    aimNote: recommendation.aimPoint || "",
    tips,
    tip: tips[0] || "",
    confidence: "best",
  };
}

function getExpandedDimensionValues(dimension, matcherValue, selectedValue) {
  if (selectedValue) {
    return getDimensionMatchStrength(matcherValue, selectedValue) > 0
      ? [selectedValue]
      : [];
  }

  if (matcherValue === "*") {
    return Array.from(SOURCE_DIMENSIONS[dimension]);
  }

  return Array.isArray(matcherValue) ? matcherValue : [];
}

function normalizeReferenceRows(entry, filter) {
  const suggestedFor = entry?.suggestedFor || {};
  const reference = entry?.reference;

  if (!reference?.profile || !reference?.disc || !reference?.category) {
    return [];
  }

  const winds = getExpandedDimensionValues("wind", suggestedFor.wind, filter.wind);
  const terrains = getExpandedDimensionValues(
    "terrain",
    suggestedFor.terrain,
    filter.terrain
  );
  const shots = getExpandedDimensionValues("shot", suggestedFor.shot, filter.shot);
  const releaseAngles = getExpandedDimensionValues(
    "releaseAngle",
    suggestedFor.releaseAngle,
    filter.releaseAngle
  );

  const rows = [];
  for (const windId of winds) {
    for (const terrainId of terrains) {
      for (const shotId of shots) {
        for (const releaseAngle of releaseAngles) {
          rows.push({
            disc: reference.disc,
            category: reference.category,
            profile: reference.profile,
            explanation: reference.explanation || "",
            tips: Array.isArray(reference.tips) ? reference.tips : [],
            windId,
            terrainId,
            shotId,
            releaseAngle,
          });
        }
      }
    }
  }

  return rows;
}

function sourceToId(map, sourceValue) {
  const found = Object.entries(map).find(([, source]) => source === sourceValue);
  return found ? found[0] : sourceValue;
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

  const best = selectBestEntry(
    functionName,
    {
      wind,
      terrain,
      shot,
      releaseAngle: selectedReleaseAngle,
    },
    ENTRIES_WITH_INDEX
  );

  return best ? normalizeRecommendation(shotId, best.entry) : null;
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
 * Get compiled reference entries filtered by any combination of factors.
 *
 * @param {object} params Query parameters.
 * @param {string | null} [params.windId=null] Optional wind id from WIND_DIRECTIONS.
 * @param {string | null} [params.terrainId=null] Optional terrain id from TERRAIN_TYPES.
 * @param {string | null} [params.shotId=null] Optional shot shape id from SHOT_SHAPES.
 * @param {string | null} [params.releaseAngle=null] Optional release angle: 'hyzer' | 'flat' | 'anhyzer'.
 * @returns {object[]} Filtered reference entries.
 */
export function getFilteredRecommendations({
  windId = null,
  terrainId = null,
  shotId = null,
  releaseAngle = null,
}) {
  const functionName = "getFilteredRecommendations";
  const selectedFilter = {
    wind: windId
      ? toSourceValue(functionName, "wind", windId, WIND_ID_TO_SOURCE)
      : null,
    terrain: terrainId
      ? toSourceValue(functionName, "terrain", terrainId, TERRAIN_ID_TO_SOURCE)
      : null,
    shot: shotId
      ? toSourceValue(functionName, "shot", shotId, SHOT_ID_TO_SOURCE)
      : null,
    releaseAngle: releaseAngle
      ? toSourceReleaseAngle(functionName, releaseAngle)
      : null,
  };

  const rows = [];

  for (const { entry } of ENTRIES_WITH_INDEX) {
    const normalizedRows = normalizeReferenceRows(entry, selectedFilter);
    for (const row of normalizedRows) {
      rows.push({
        ...row,
        windId: sourceToId(WIND_ID_TO_SOURCE, row.windId),
        terrainId: sourceToId(TERRAIN_ID_TO_SOURCE, row.terrainId),
        shotId: sourceToId(SHOT_ID_TO_SOURCE, row.shotId),
      });
    }
  }

  return rows;
}

/**
 * Get unique disc types for the selected filter set with grouped explanations.
 *
 * @param {object} params Query parameters.
 * @param {string | null} [params.windId=null] Optional wind id from WIND_DIRECTIONS.
 * @param {string | null} [params.terrainId=null] Optional terrain id from TERRAIN_TYPES.
 * @param {string | null} [params.shotId=null] Optional shot shape id from SHOT_SHAPES.
 * @param {string | null} [params.releaseAngle=null] Optional release angle: 'hyzer' | 'flat' | 'anhyzer'.
 * @returns {object[]} Unique disc types for the selected filters.
 */
export function getDiscTypesForCondition({
  windId = null,
  terrainId = null,
  shotId = null,
  releaseAngle = null,
}) {
  const filteredRecommendations = getFilteredRecommendations({
    windId,
    terrainId,
    shotId,
    releaseAngle,
  });

  const typeMap = new Map();

  for (const result of filteredRecommendations) {
    const key = `${result.disc}|${result.category}`;
    const existing = typeMap.get(key);

    if (!existing) {
      typeMap.set(key, {
        disc: result.disc,
        category: result.category,
        explanations: new Set([result.explanation]),
        tips: new Set(Array.isArray(result.tips) ? result.tips : []),
      });
      continue;
    }

    existing.explanations.add(result.explanation);
    for (const tip of result.tips || []) {
      existing.tips.add(tip);
    }
  }

  const grouped = Array.from(typeMap.values()).map((entry) => {
    const explanations = Array.from(entry.explanations);
    const tips = Array.from(entry.tips);

    return {
      disc: entry.disc,
      category: entry.category,
      explanations: explanations.slice(0, 6),
      explanationOverflowCount: Math.max(explanations.length - 6, 0),
      tips: tips.slice(0, 6),
      tipsOverflowCount: Math.max(tips.length - 6, 0),
    };
  });

  grouped.sort((a, b) => {
    const categoryDelta =
      (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);
    if (categoryDelta !== 0) {
      return categoryDelta;
    }

    return (DISC_ORDER[a.disc] ?? 99) - (DISC_ORDER[b.disc] ?? 99);
  });

  return grouped;
}

/**
 * Internal matcher helpers exposed for unit testing.
 */
export const __matcherInternals = {
  getDimensionMatchStrength,
  getSpecificityScore,
  selectBestEntry,
};
