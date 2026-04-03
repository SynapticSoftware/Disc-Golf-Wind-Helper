import test from "node:test";
import assert from "node:assert/strict";
import guide from "../../../disc-golf-wind-guide.json" with { type: "json" };
import {
  __matcherInternals,
  getRecommendation,
} from "../src/data.js";
import { AppError } from "../src/errors.js";

test("matcher specificity prefers exact over set and wildcard", () => {
  const selected = {
    wind: "headwind",
    terrain: "flat",
    shot: "straight",
    releaseAngle: "flat",
  };

  const wildcardScore = __matcherInternals.getSpecificityScore(
    {
      suggestedFor: {
        wind: "*",
        terrain: "*",
        shot: "*",
        releaseAngle: "*",
      },
    },
    selected
  );

  const setScore = __matcherInternals.getSpecificityScore(
    {
      suggestedFor: {
        wind: ["headwind", "tailwind"],
        terrain: ["flat"],
        shot: ["straight"],
        releaseAngle: ["flat"],
      },
    },
    selected
  );

  const exactScore = __matcherInternals.getSpecificityScore(
    {
      suggestedFor: {
        wind: ["headwind"],
        terrain: ["flat"],
        shot: ["straight"],
        releaseAngle: ["flat"],
      },
    },
    selected
  );

  assert.ok(exactScore > setScore);
  assert.ok(setScore > wildcardScore);
});

test("matcher priority breaks ties", () => {
  const entries = [
    {
      entry: {
        id: "low-priority",
        priority: 1,
        suggestedFor: {
          wind: ["headwind"],
          terrain: ["flat"],
          shot: ["straight"],
          releaseAngle: ["flat"],
        },
      },
      index: 0,
    },
    {
      entry: {
        id: "high-priority",
        priority: 100,
        suggestedFor: {
          wind: ["headwind"],
          terrain: ["flat"],
          shot: ["straight"],
          releaseAngle: ["flat"],
        },
      },
      index: 1,
    },
  ];

  const selected = {
    wind: "headwind",
    terrain: "flat",
    shot: "straight",
    releaseAngle: "flat",
  };

  const best = __matcherInternals.selectBestEntry(
    "testMatcherPriority",
    selected,
    entries
  );

  assert.equal(best.entry.id, "high-priority");
});

test("matcher throws AppError on unresolved ambiguity", () => {
  const entries = [
    {
      entry: {
        id: "same-priority-a",
        priority: 10,
        suggestedFor: {
          wind: ["headwind"],
          terrain: ["flat"],
          shot: ["straight"],
          releaseAngle: ["flat"],
        },
      },
      index: 0,
    },
    {
      entry: {
        id: "same-priority-b",
        priority: 10,
        suggestedFor: {
          wind: ["headwind"],
          terrain: ["flat"],
          shot: ["straight"],
          releaseAngle: ["flat"],
        },
      },
      index: 1,
    },
  ];

  assert.throws(
    () =>
      __matcherInternals.selectBestEntry(
        "testMatcherAmbiguous",
        {
          wind: "headwind",
          terrain: "flat",
          shot: "straight",
          releaseAngle: "flat",
        },
        entries
      ),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(
        error.userMessage,
        "Could not resolve a recommendation for this condition."
      );
      assert.match(error.debugContext, /Ambiguous entries/);
      return true;
    }
  );
});

test("getRecommendation throws AppError for invalid keys", () => {
  assert.throws(
    () =>
      getRecommendation({
        windId: "not-a-real-wind",
        terrainId: "flat",
        shotId: "straight",
      }),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(
        error.userMessage,
        "Could not read recommendation data. Check your selected conditions."
      );
      assert.match(error.debugContext, /Unknown wind id/);
      return true;
    }
  );
});

test("getRecommendation matches legacy suggester outputs for all wind/terrain/shot combos", () => {
  const legacyGuide = guide.wind_guide || {};

  const windKeys = Object.keys(legacyGuide);
  for (const windId of windKeys) {
    const terrains = legacyGuide[windId] || {};
    const terrainKeys = Object.keys(terrains);
    for (const terrainId of terrainKeys) {
      const shots = terrains[terrainId] || {};
      const shotKeys = Object.keys(shots);
      for (const shotId of shotKeys) {
        const legacy = shots[shotId];
        const recommendation = getRecommendation({
          windId,
          terrainId,
          shotId,
        });

        assert.ok(recommendation, `${windId}/${terrainId}/${shotId} should resolve`);
        assert.equal(recommendation.disc, legacy.disc.stability);
        assert.equal(recommendation.category, legacy.disc.category);
        assert.equal(recommendation.angle, legacy.angle);
        assert.equal(recommendation.summary, legacy.disc_explanation);
        assert.equal(recommendation.aimNote, legacy.aim_point);
      }
    }
  }
});
