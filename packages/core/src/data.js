import suggestionsSource from "../data/suggestions.json";
import windGuideMetaSource from "../data/wind-guide-meta.json";
import referenceBaseSource from "../data/reference-base.json";
import referenceModifiersSource from "../data/reference-modifiers.json";
import referenceOverridesSource from "../data/reference-overrides.json";

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

const RELEASE_ANGLE_OPTIONS = ["hyzer", "flat", "anhyzer"];

const WIND_ID_TO_SOURCE = Object.fromEntries(
  WIND_CONFIG.map((entry) => [entry.id, entry.sourceKey])
);

const TERRAIN_ID_TO_SOURCE = Object.fromEntries(
  TERRAIN_CONFIG.map((entry) => [entry.id, entry.sourceKey])
);

const SHOT_ID_TO_SOURCE = Object.fromEntries(
  SHOT_CONFIG.map((entry) => [entry.id, entry.sourceKey])
);

const SUGGESTIONS_SOURCE = suggestionsSource || {};
const REFERENCE_BASE_SOURCE = referenceBaseSource || {};
const REFERENCE_MODIFIERS_SOURCE = referenceModifiersSource || {};
const REFERENCE_OVERRIDES_SOURCE = referenceOverridesSource || {};
const DISC_PROFILES = REFERENCE_BASE_SOURCE.discProfiles || {};
const DISC_PROFILE_IDS = Object.keys(DISC_PROFILES);

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

export const windGuideMeta = windGuideMetaSource || {};
export const referenceMeta = {
  windKeys: WIND_CONFIG.map((item) => item.id),
  terrainKeys: TERRAIN_CONFIG.map((item) => item.id),
  shotKeys: SHOT_CONFIG.map((item) => item.id),
  releaseAngles: RELEASE_ANGLE_OPTIONS,
  discProfiles: DISC_PROFILE_IDS,
};

function normalizeSuggestion(shotId, entry) {
  if (!entry || !entry.disc || !entry.disc.stability) {
    return null;
  }

  const tips = Array.isArray(entry.tips) ? entry.tips : [];

  return {
    shotId,
    disc: entry.disc.stability,
    category: entry.disc.category,
    angle: entry.angle,
    summary: entry.disc_explanation,
    aimNote: entry.aim_point,
    tips,
    tip: tips[0] || "",
    confidence: "best",
  };
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function joinText(parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Get a single suggester recommendation for one wind + terrain + shot combination.
 *
 * @param {object} params Query parameters.
 * @param {string} params.windId Selected wind id from WIND_DIRECTIONS.
 * @param {string} params.terrainId Selected terrain id from TERRAIN_TYPES.
 * @param {string} params.shotId Selected shot id from SHOT_SHAPES.
 * @returns {object | null} Normalized suggester recommendation or null if unavailable.
 */
export function getRecommendation({ windId, terrainId, shotId }) {
  const windKey = WIND_ID_TO_SOURCE[windId];
  const terrainKey = TERRAIN_ID_TO_SOURCE[terrainId];
  const shotKey = SHOT_ID_TO_SOURCE[shotId];

  if (!windKey || !terrainKey || !shotKey) {
    return null;
  }

  const rawEntry = SUGGESTIONS_SOURCE[windKey]?.[terrainKey]?.[shotKey];
  return normalizeSuggestion(shotId, rawEntry);
}

/**
 * Build suggester lookup in the shape: suggestions[shotId][windId][terrainId] => recommendation[]
 *
 * @returns {Record<string, Record<string, Record<string, object[]>>>} Suggestions lookup table.
 */
function buildSuggestions() {
  const suggestionsIndex = {};

  for (const shot of SHOT_SHAPES) {
    suggestionsIndex[shot.id] = {};

    for (const wind of WIND_DIRECTIONS) {
      suggestionsIndex[shot.id][wind.id] = {};

      for (const terrain of TERRAIN_TYPES) {
        const recommendation = getRecommendation({
          windId: wind.id,
          terrainId: terrain.id,
          shotId: shot.id,
        });

        suggestionsIndex[shot.id][wind.id][terrain.id] = recommendation ? [recommendation] : [];
      }
    }
  }

  return suggestionsIndex;
}

export const suggestions = buildSuggestions();

/**
 * Get all suggester recommendations for one wind + terrain combination.
 *
 * @param {object} params Query parameters.
 * @param {string} params.windId Selected wind id from WIND_DIRECTIONS.
 * @param {string} params.terrainId Selected terrain id from TERRAIN_TYPES.
 * @returns {object[]} Ordered suggester recommendations.
 */
export function getRecommendationsForCondition({ windId, terrainId }) {
  return SHOT_SHAPES.map((shot) => getRecommendation({ windId, terrainId, shotId: shot.id })).filter(Boolean);
}

function getReferenceEntry({
  windId,
  terrainId,
  shotId,
  releaseAngle,
  discProfileId,
}) {
  const windKey = WIND_ID_TO_SOURCE[windId];
  const terrainKey = TERRAIN_ID_TO_SOURCE[terrainId];
  const shotKey = SHOT_ID_TO_SOURCE[shotId];

  if (!windKey || !terrainKey || !shotKey || !releaseAngle || !discProfileId) {
    return null;
  }

  const profileData = DISC_PROFILES[discProfileId];
  if (!profileData) {
    return null;
  }

  const windData = REFERENCE_MODIFIERS_SOURCE.wind?.[windKey];
  const terrainData = REFERENCE_MODIFIERS_SOURCE.terrain?.[terrainKey];
  const shotData = REFERENCE_MODIFIERS_SOURCE.shot?.[shotKey];
  const releaseData = REFERENCE_MODIFIERS_SOURCE.releaseAngle?.[releaseAngle];
  const override = REFERENCE_OVERRIDES_SOURCE?.[windKey]?.[terrainKey]?.[shotKey]?.[releaseAngle]?.[discProfileId];

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

  return {
    disc: profileData.disc,
    category: profileData.category,
    profile: discProfileId,
    explanation,
    tips,
  };
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
  const selectedWinds = windId ? [windId] : WIND_DIRECTIONS.map((wind) => wind.id);
  const selectedTerrains = terrainId ? [terrainId] : TERRAIN_TYPES.map((terrain) => terrain.id);
  const selectedShots = shotId ? [shotId] : SHOT_SHAPES.map((shot) => shot.id);
  const selectedAngles = releaseAngle ? [releaseAngle] : RELEASE_ANGLE_OPTIONS;

  const filtered = [];

  for (const windOption of selectedWinds) {
    for (const terrainOption of selectedTerrains) {
      for (const shotOption of selectedShots) {
        for (const angleOption of selectedAngles) {
          for (const profileId of DISC_PROFILE_IDS) {
            const entry = getReferenceEntry({
              windId: windOption,
              terrainId: terrainOption,
              shotId: shotOption,
              releaseAngle: angleOption,
              discProfileId: profileId,
            });

            if (!entry) {
              continue;
            }

            filtered.push({
              ...entry,
              windId: windOption,
              terrainId: terrainOption,
              shotId: shotOption,
              releaseAngle: angleOption,
            });
          }
        }
      }
    }
  }

  return filtered;
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
    const categoryDelta = (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99);
    if (categoryDelta !== 0) {
      return categoryDelta;
    }

    return (DISC_ORDER[a.disc] ?? 99) - (DISC_ORDER[b.disc] ?? 99);
  });

  return grouped;
}
