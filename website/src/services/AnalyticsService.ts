import posthog, { CaptureOptions, Properties } from 'posthog-js';

export const SendEvent = (
  event: string,
  properties?: Properties,
  options?: CaptureOptions,
) => {
  posthog.capture(event, properties, options);
};

export const enablePostHog = () => {
  posthog.opt_in_capturing();
};

export const disablePostHog = () => {
  posthog.opt_out_capturing();
};
