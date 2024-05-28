import React, { useEffect } from 'react';

import { eventEmitter } from '../../events/EventEmitter';

import { ToastType, useToast } from './ToastContext';

const ToastErrorWrapper: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    const toastError = (msg: string) => {
      showToast(msg, ToastType.Error);
    };

    const toastWarning = (msg: string) => {
      showToast(msg, ToastType.Warning);
    };

    const toastSuccess = (msg: string) => {
      showToast(msg, ToastType.Success);
    };

    eventEmitter.on('warning', toastWarning); // Listen for warning events
    eventEmitter.on('success', toastSuccess); // Listen for success events
    eventEmitter.on('apiError', toastError); // Listen for apiError events
    eventEmitter.on('error', toastError); // Listen for error events (for non-API errors)

    return () => {
      eventEmitter.off('apiError', toastError);
      eventEmitter.off('error', toastError);
      eventEmitter.off('warning', toastWarning);
      eventEmitter.off('success', toastSuccess);
    };
  }, [showToast]);

  // This component doesn't render anything itself
  return null;
};

export default ToastErrorWrapper;
