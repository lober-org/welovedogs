/**
 * Error handling utilities for extracting and formatting error messages.
 */

/**
 * Extracts a human-readable error message from an unknown error type.
 * Handles Error instances, strings, and other types gracefully.
 *
 * @param err - The error to extract a message from
 * @returns A string representation of the error message
 */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }
  return String(err);
}
