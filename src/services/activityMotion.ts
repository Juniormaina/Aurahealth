/**
 * Optional device motion / step hints for Shamba Fit.
 * Never a hard dependency — manual logging always works.
 */

export type MotionSupport = {
  supported: boolean;
  message: string;
};

export function checkActivityMotionSupport(): MotionSupport {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      message: "Automatic activity detection isn't available on this device. You can still log your activity manually.",
    };
  }

  const hasDeviceMotion = typeof DeviceMotionEvent !== 'undefined';
  // Pedometer / Sensor API is rare on the open web; treat as unsupported unless clearly present.
  const hasSensorApi =
    typeof (window as unknown as { Pedometer?: unknown }).Pedometer !== 'undefined' ||
    typeof (navigator as Navigator & { permissions?: unknown }).permissions !== 'undefined';

  if (!hasDeviceMotion && !hasSensorApi) {
    return {
      supported: false,
      message: "Automatic activity detection isn't available on this device. You can still log your activity manually.",
    };
  }

  // iOS requires a user gesture for DeviceMotionEvent.requestPermission — we only advertise capability.
  const needsPermission =
    typeof (DeviceMotionEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function';

  return {
    supported: true,
    message: needsPermission
      ? 'Motion sensors may be available. Tap Enable motion for optional hints — you can always log manually.'
      : 'Motion sensors may be available for optional hints. Manual logging remains the primary way to record activity.',
  };
}

/**
 * Request iOS motion permission if needed. Returns whether we can listen.
 * Does not start continuous tracking or use geolocation.
 */
export async function requestMotionPermission(): Promise<boolean> {
  try {
    const req = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<PermissionState> })
      .requestPermission;
    if (typeof req === 'function') {
      const state = await req();
      return state === 'granted';
    }
    return typeof DeviceMotionEvent !== 'undefined';
  } catch {
    return false;
  }
}
