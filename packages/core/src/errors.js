/**
 * Typed application error used across core selectors/utilities.
 */
export class AppError extends Error {
  /**
   * @param {string} userMessage Friendly message intended for UI surfaces.
   * @param {string} debugContext Developer context describing where/why failure happened.
   */
  constructor(userMessage, debugContext) {
    super(userMessage);
    this.name = "AppError";
    this.userMessage = userMessage;
    this.debugContext = debugContext;
  }
}
