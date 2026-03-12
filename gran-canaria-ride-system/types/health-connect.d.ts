export {};

declare global {
  interface Window {
    HealthConnectBridge?: {
      isAvailable?: () => boolean | Promise<boolean>;
      requestPermissions?: () => boolean | Promise<boolean>;
      getTodaySteps: () => number | Promise<number>;
    };
  }
}
