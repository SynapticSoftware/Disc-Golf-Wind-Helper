import test from "node:test";
import assert from "node:assert/strict";
import guide from "../../../disc-golf-wind-guide.json" with { type: "json" };
import normalizedRecommendations from "../data/recommendations.json" with { type: "json" };
import {
  __referenceInternals,
  getRecommendation,
  getReferenceCardsForCondition,
} from "../src/data.js";
import { AppError } from "../src/errors.js";

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

  for (const [windId, terrains] of Object.entries(legacyGuide)) {
    for (const [terrainId, shots] of Object.entries(terrains || {})) {
      for (const [shotId, legacy] of Object.entries(shots || {})) {
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

test("validateNormalizedSource throws AppError for malformed schema", () => {
  const malformed = structuredClone(normalizedRecommendations);
  delete malformed.conditions;

  assert.throws(
    () =>
      __referenceInternals.validateNormalizedSource(
        "testValidateNormalizedSource",
        malformed
      ),
    (error) => {
      assert.ok(error instanceof AppError);
      assert.equal(
        error.userMessage,
        "Could not read recommendation data. Check your selected conditions."
      );
      assert.match(error.debugContext, /conditions must be an array/);
      return true;
    }
  );
});

test("normalized schema contains one condition per factor combination", () => {
  const dimensions = normalizedRecommendations.dimensions;
  const expectedCount =
    dimensions.wind.length *
    dimensions.terrain.length *
    dimensions.shot.length *
    dimensions.releaseAngle.length;

  assert.equal(normalizedRecommendations.conditions.length, expectedCount);

  const keys = new Set(
    normalizedRecommendations.conditions.map((condition) => {
      const suggestedFor = condition.suggestedFor;
      return `${suggestedFor.wind[0]}|${suggestedFor.terrain[0]}|${suggestedFor.shot[0]}|${suggestedFor.releaseAngle[0]}`;
    })
  );

  assert.equal(keys.size, expectedCount);
});

test("getReferenceCardsForCondition exact filter returns single matched value per factor", () => {
  const cards = getReferenceCardsForCondition({
    windId: "headwind",
    terrainId: "flat",
    shotId: "straight",
    releaseAngle: "hyzer",
  });

  assert.equal(cards.length, 9);

  for (const card of cards) {
    assert.equal(card.factorExplanations.wind.length, 1);
    assert.deepEqual(card.factorExplanations.wind[0].matchedValues, ["headwind"]);

    assert.equal(card.factorExplanations.terrain.length, 1);
    assert.deepEqual(card.factorExplanations.terrain[0].matchedValues, ["flat"]);

    assert.equal(card.factorExplanations.shot.length, 1);
    assert.deepEqual(card.factorExplanations.shot[0].matchedValues, ["straight"]);

    assert.equal(card.factorExplanations.releaseAngle.length, 1);
    assert.deepEqual(card.factorExplanations.releaseAngle[0].matchedValues, ["hyzer"]);
  }
});

test("getReferenceCardsForCondition groups undefined-factor ranges without duplicating base text", () => {
  const cards = getReferenceCardsForCondition({});
  const stableDriver = cards.find(
    (card) => card.disc === "stable" && card.category === "driver"
  );

  assert.ok(stableDriver);
  assert.match(stableDriver.baseExplanation, /^Stable driver is a balanced distance option\./);

  const windValueCount = stableDriver.factorExplanations.wind.reduce(
    (count, item) => count + item.matchedValues.length,
    0
  );
  const terrainValueCount = stableDriver.factorExplanations.terrain.reduce(
    (count, item) => count + item.matchedValues.length,
    0
  );
  const shotValueCount = stableDriver.factorExplanations.shot.reduce(
    (count, item) => count + item.matchedValues.length,
    0
  );
  const releaseAngleValueCount = stableDriver.factorExplanations.releaseAngle.reduce(
    (count, item) => count + item.matchedValues.length,
    0
  );

  assert.equal(windValueCount, 9);
  assert.equal(terrainValueCount, 3);
  assert.equal(shotValueCount, 8);
  assert.equal(releaseAngleValueCount, 3);
});

test("situational summaries are derived from matched filter conditions for every card", () => {
  const selected = {
    windId: "headwind",
    terrainId: "flat",
    shotId: "straight",
  };
  const cards = getReferenceCardsForCondition(selected);

  assert.equal(cards.length, 9);
  for (const card of cards) {
    const conditionCount = card.situationalSummaries.reduce(
      (count, summary) => count + summary.conditionCount,
      0
    );
    assert.equal(conditionCount, 3);
  }

  const exactCards = getReferenceCardsForCondition({
    ...selected,
    releaseAngle: "hyzer",
  });

  for (const card of exactCards) {
    assert.equal(card.situationalSummaries.length, 1);
    assert.equal(card.situationalSummaries[0].conditionCount, 1);
  }
});
