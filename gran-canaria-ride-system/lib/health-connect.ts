export type HealthConnectErrorCode =
  | "NOT_SUPPORTED"
  | "PERMISSION_DENIED"
  | "PROVIDER_UNAVAILABLE"
  | "INVALID_RESPONSE";

export class HealthConnectError extends Error {
  code: HealthConnectErrorCode;

  constructor(code: HealthConnectErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

function getBridge() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.HealthConnectBridge ?? null;
}

export async function getTodayStepsFromHealthConnect(): Promise<number> {
  const bridge = getBridge();

  if (!bridge || typeof bridge.getTodaySteps !== "function") {
    throw new HealthConnectError(
      "NOT_SUPPORTED",
      "Health Connect bridge is not available on this device",
    );
  }

  const available =
    typeof bridge.isAvailable === "function"
      ? await Promise.resolve(bridge.isAvailable())
      : true;

  if (!available) {
    throw new HealthConnectError(
      "PROVIDER_UNAVAILABLE",
      "Health Connect provider is unavailable",
    );
  }

  if (typeof bridge.requestPermissions === "function") {
    const granted = await Promise.resolve(bridge.requestPermissions());
    if (!granted) {
      throw new HealthConnectError(
        "PERMISSION_DENIED",
        "Permission denied for reading step data",
      );
    }
  }

  const rawSteps = await Promise.resolve(bridge.getTodaySteps());
  const steps = Number(rawSteps);

  if (!Number.isInteger(steps) || steps < 0) {
    throw new HealthConnectError(
      "INVALID_RESPONSE",
      "Invalid step payload from Health Connect",
    );
  }

  return steps;
}
