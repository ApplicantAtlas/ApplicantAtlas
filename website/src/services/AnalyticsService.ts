import posthog, { CaptureOptions, Properties } from 'posthog-js';

export const SendEvent = (
  event: string,
  properties?: Properties,
  options?: CaptureOptions,
) => {
  posthog.capture(event, properties, options);
};
