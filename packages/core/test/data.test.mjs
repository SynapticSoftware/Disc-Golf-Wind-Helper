import test from "node:test";
import assert from "node:assert/strict";
import guide from "../../../disc-golf-wind-guide.json" with { type: "json" };
import normalizedRecommendations from "../data/recommendations.json" with { type: "json" };
import {
  ALTERNATE_THROW_PERSPECTIVE,
  __referenceInternals,
  getCategoryComparisonForCondition,
  getRecommendation,
  getShotShapes,
  getReferenceCardsForCondition,
  getWindDirections,
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

test("getCategoryComparisonForCondition returns all three disc categories", () => {
  const result = getCategoryComparisonForCondition({
    windId: "headwind",
    terrainId: "flat",
    shotId: "straight",
  });

  assert.ok(result);
  assert.equal(result.categoryComparisons.length, 3);
  assert.deepEqual(
    result.categoryComparisons.map((item) => item.category),
    ["driver", "mid", "putter"]
  );
});

test("category comparisons share stability and preserve one primary category", () => {
  const result = getCategoryComparisonForCondition({
    windId: "tailwind_right_to_left",
    terrainId: "downhill",
    shotId: "short_right",
  });

  assert.ok(result);

  for (const item of result.categoryComparisons) {
    assert.equal(item.disc, result.primaryRecommendation.disc);
    assert.equal(typeof item.fitScore, "number");
    assert.ok(item.whenToUse.length > 0);
    assert.ok(item.tradeoff.length > 0);
  }

  const primaryMatches = result.categoryComparisons.filter(
    (item) => item.isPrimaryMatch
  );
  assert.equal(primaryMatches.length, 1);
  assert.equal(
    primaryMatches[0].category,
    result.primaryRecommendation.category
  );
});

test("getCategoryComparisonForCondition throws AppError for invalid keys", () => {
  assert.throws(
    () =>
      getCategoryComparisonForCondition({
        windId: "bad-wind-id",
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

test("perspective mirror helpers swap directional wind and shot ids", () => {
  assert.equal(
    __referenceInternals.toSourceWindId("right_to_left", ALTERNATE_THROW_PERSPECTIVE),
    "left_to_right"
  );
  assert.equal(
    __referenceInternals.toSourceWindId("headwind", ALTERNATE_THROW_PERSPECTIVE),
    "headwind"
  );
  assert.equal(
    __referenceInternals.toSourceShotId("long_left", ALTERNATE_THROW_PERSPECTIVE),
    "long_right"
  );
  assert.equal(
    __referenceInternals.toSourceShotId("straight", ALTERNATE_THROW_PERSPECTIVE),
    "straight"
  );
});

test("perspective-aware config getters mirror directional labels and icons", () => {
  const mirroredWinds = getWindDirections(ALTERNATE_THROW_PERSPECTIVE);
  const mirroredShots = getShotShapes(ALTERNATE_THROW_PERSPECTIVE);

  const rightToLeftWind = mirroredWinds.find((item) => item.id === "right_to_left");
  assert.ok(rightToLeftWind);
  assert.equal(rightToLeftWind.label, "L→R Cross");
  assert.equal(rightToLeftWind.icon, "→");

  const shortLeftShot = mirroredShots.find((item) => item.id === "short_left");
  assert.ok(shortLeftShot);
  assert.equal(shortLeftShot.label, "Short Right Turn");
  assert.equal(shortLeftShot.icon, "↗️");
});

test("getRecommendation mirrors canonical result text for alternate perspective", () => {
  const mirroredRecommendation = getRecommendation({
    windId: "right_to_left",
    terrainId: "flat",
    shotId: "long_left",
    releaseAngle: "flat",
    perspective: ALTERNATE_THROW_PERSPECTIVE,
  });

  const canonicalRecommendation = getRecommendation({
    windId: "left_to_right",
    terrainId: "flat",
    shotId: "long_right",
    releaseAngle: "flat",
  });

  assert.ok(mirroredRecommendation);
  assert.ok(canonicalRecommendation);
  assert.equal(mirroredRecommendation.disc, canonicalRecommendation.disc);
  assert.equal(mirroredRecommendation.category, canonicalRecommendation.category);
  assert.equal(
    mirroredRecommendation.summary,
    __referenceInternals.mirrorDirectionalText(canonicalRecommendation.summary)
  );
  assert.equal(
    mirroredRecommendation.aimNote,
    __referenceInternals.mirrorDirectionalText(canonicalRecommendation.aimNote)
  );
  assert.deepEqual(
    mirroredRecommendation.tips,
    canonicalRecommendation.tips.map((tip) =>
      __referenceInternals.mirrorDirectionalText(tip)
    )
  );
});

test("getCategoryComparisonForCondition preserves mirrored perspective parity", () => {
  const mirrored = getCategoryComparisonForCondition({
    windId: "right_to_left",
    terrainId: "flat",
    shotId: "long_left",
    perspective: ALTERNATE_THROW_PERSPECTIVE,
  });

  const canonical = getCategoryComparisonForCondition({
    windId: "left_to_right",
    terrainId: "flat",
    shotId: "long_right",
  });

  assert.ok(mirrored);
  assert.ok(canonical);
  assert.equal(
    mirrored.primaryRecommendation.category,
    canonical.primaryRecommendation.category
  );
  assert.equal(
    mirrored.primaryRecommendation.disc,
    canonical.primaryRecommendation.disc
  );

  for (const category of ["driver", "mid", "putter"]) {
    const mirroredCard = mirrored.categoryComparisons.find(
      (item) => item.category === category
    );
    const canonicalCard = canonical.categoryComparisons.find(
      (item) => item.category === category
    );

    assert.ok(mirroredCard);
    assert.ok(canonicalCard);
    assert.equal(mirroredCard.fitScore, canonicalCard.fitScore);
    assert.equal(mirroredCard.isPrimaryMatch, canonicalCard.isPrimaryMatch);
    assert.equal(mirroredCard.whenToUse, canonicalCard.whenToUse);
    assert.equal(mirroredCard.tradeoff, canonicalCard.tradeoff);
  }
});

test("getReferenceCardsForCondition mirrors matched values and directional text", () => {
  const mirroredCards = getReferenceCardsForCondition({
    windId: "right_to_left",
    terrainId: "flat",
    shotId: "long_left",
    releaseAngle: "flat",
    perspective: ALTERNATE_THROW_PERSPECTIVE,
  });

  const canonicalCards = getReferenceCardsForCondition({
    windId: "left_to_right",
    terrainId: "flat",
    shotId: "long_right",
    releaseAngle: "flat",
  });

  assert.equal(mirroredCards.length, canonicalCards.length);

  for (const mirroredCard of mirroredCards) {
    const canonicalCard = canonicalCards.find(
      (card) => card.profileId === mirroredCard.profileId
    );
    assert.ok(canonicalCard);
    assert.equal(
      mirroredCard.baseExplanation,
      __referenceInternals.mirrorDirectionalText(canonicalCard.baseExplanation)
    );
    assert.equal(mirroredCard.factorExplanations.wind.length, 1);
    assert.equal(mirroredCard.factorExplanations.shot.length, 1);
    assert.deepEqual(mirroredCard.factorExplanations.wind[0].matchedValues, [
      "right_to_left",
    ]);
    assert.deepEqual(mirroredCard.factorExplanations.shot[0].matchedValues, [
      "long_left",
    ]);
    assert.equal(
      mirroredCard.factorExplanations.wind[0].text,
      __referenceInternals.mirrorDirectionalText(
        canonicalCard.factorExplanations.wind[0].text
      )
    );
  }
});

test("token-safe text mirror swaps directional phrases without corruption", () => {
  const sourceText =
    "RHBH players in right-to-left wind should aim right; LHBH in left-to-right should aim left.";
  const mirroredText = __referenceInternals.mirrorDirectionalText(sourceText);

  assert.equal(
    mirroredText,
    "RHFH players in left-to-right wind should aim left; LHFH in right-to-left should aim right."
  );
});
