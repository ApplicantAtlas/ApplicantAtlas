import posthog, { CaptureOptions, Properties } from 'posthog-js';

export const sendEvent = (
  event: string,
  properties?: Properties,
  options?: CaptureOptions,
) => {
  posthog.capture(event, properties, options);
};
