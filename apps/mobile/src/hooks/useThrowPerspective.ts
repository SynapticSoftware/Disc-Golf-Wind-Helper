import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AppError,
  DEFAULT_THROW_PERSPECTIVE,
  isThrowPerspective,
} from "@frisbee-wind/core";

const THROW_PERSPECTIVE_STORAGE_KEY = "frisbee-wind.throw-perspective";

function throwStorageError(functionName: string, userMessage: string, debugContext: string): never {
  const err = new AppError(userMessage, debugContext);
  console.error(`[${functionName}]`, err);
  throw err;
}

function toStoredPerspective(rawValue: string | null): string {
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

async function readThrowPerspective(): Promise<string> {
  try {
    const rawValue = await AsyncStorage.getItem(THROW_PERSPECTIVE_STORAGE_KEY);
    return toStoredPerspective(rawValue);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throwStorageError(
      "readThrowPerspective",
      "Could not load throw perspective. Please reselect your throw style.",
      `AsyncStorage read failure: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function writeThrowPerspective(perspective: string): Promise<void> {
  if (!isThrowPerspective(perspective)) {
    throwStorageError(
      "writeThrowPerspective",
      "Could not save throw perspective. Please reselect your throw style.",
      `Unsupported throw perspective value: ${perspective}`
    );
  }

  try {
    await AsyncStorage.setItem(THROW_PERSPECTIVE_STORAGE_KEY, perspective);
  } catch (error) {
    throwStorageError(
      "writeThrowPerspective",
      "Could not save throw perspective. Please try again.",
      `AsyncStorage write failure: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Store and restore the selected throw perspective for the mobile app.
 */
export default function useThrowPerspective() {
  const [perspective, setPerspectiveState] = useState(DEFAULT_THROW_PERSPECTIVE);
  const [perspectiveError, setPerspectiveError] = useState<AppError | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPerspective() {
      try {
        const storedPerspective = await readThrowPerspective();
        if (!isMounted) {
          return;
        }
        setPerspectiveState(storedPerspective);
        setPerspectiveError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setPerspectiveError(error as AppError);
      } finally {
        if (isMounted) {
          setHasLoaded(true);
        }
      }
    }

    loadPerspective();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    let isMounted = true;

    async function persistPerspective() {
      try {
        await writeThrowPerspective(perspective);
        if (isMounted) {
          setPerspectiveError(null);
        }
      } catch (error) {
        if (isMounted) {
          setPerspectiveError(error as AppError);
        }
      }
    }

    persistPerspective();
    return () => {
      isMounted = false;
    };
  }, [hasLoaded, perspective]);

  const setPerspective = useCallback((nextPerspective: string) => {
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
