import { useCallback, useEffect, useState } from "react";
import {
  AppError,
  DEFAULT_THROW_PERSPECTIVE,
  isThrowPerspective,
} from "@frisbee-wind/core";

const THROW_PERSPECTIVE_STORAGE_KEY = "frisbee-wind.throw-perspective";

function throwStorageError(functionName, userMessage, debugContext) {
  const err = new AppError(userMessage, debugContext);
  console.error(`[${functionName}]`, err);
  throw err;
}

function toStoredPerspective(rawValue) {
  if (rawValue == null || rawValue === "") {
    return DEFAULT_THROW_PERSPECTIVE;
  }

  if (!isThrowPerspective(rawValue)) {
    throwStorageError(
      "toStoredPerspective",
      "Could not load throw perspective. Please reselect your throw style.",
      `Unsupported stored throw perspective value: ${rawValue}`
    );
  }

  return rawValue;
}

function readThrowPerspective() {
  try {
    const rawValue = window.localStorage.getItem(THROW_PERSPECTIVE_STORAGE_KEY);
    return toStoredPerspective(rawValue);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throwStorageError(
      "readThrowPerspective",
      "Could not load throw perspective. Please reselect your throw style.",
      `localStorage read failure: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function writeThrowPerspective(perspective) {
  if (!isThrowPerspective(perspective)) {
    throwStorageError(
      "writeThrowPerspective",
      "Could not save throw perspective. Please reselect your throw style.",
      `Unsupported throw perspective value: ${perspective}`
    );
  }

  try {
    window.localStorage.setItem(THROW_PERSPECTIVE_STORAGE_KEY, perspective);
  } catch (error) {
    throwStorageError(
      "writeThrowPerspective",
      "Could not save throw perspective. Please try again.",
      `localStorage write failure: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Store and restore the selected throw perspective for the web app.
 *
 * @returns {{
 *   perspective: string,
 *   setPerspective: (nextPerspective: string) => void,
 *   perspectiveError: AppError | null,
 * }} Throw perspective state and persistence error.
 */
export default function useThrowPerspective() {
  const [perspective, setPerspectiveState] = useState(DEFAULT_THROW_PERSPECTIVE);
  const [perspectiveError, setPerspectiveError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    try {
      setPerspectiveState(readThrowPerspective());
      setPerspectiveError(null);
    } catch (error) {
      setPerspectiveError(error);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    try {
      writeThrowPerspective(perspective);
      setPerspectiveError(null);
    } catch (error) {
      setPerspectiveError(error);
    }
  }, [hasLoaded, perspective]);

  const setPerspective = useCallback((nextPerspective) => {
    if (!isThrowPerspective(nextPerspective)) {
      const err = new AppError(
        "Could not change throw perspective. Please choose a valid option.",
        `Unsupported throw perspective value: ${nextPerspective}`
      );
      console.error("[setThrowPerspective]", err);
      setPerspectiveError(err);
      return;
    }

    setPerspectiveState(nextPerspective);
  }, []);

  return {
    perspective,
    setPerspective,
    perspectiveError,
  };
}
