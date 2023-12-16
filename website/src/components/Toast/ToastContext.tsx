// ToastContext.tsx
import React, { Fragment, createContext, useContext, useEffect, useState } from "react";

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {
    
  },
});

export const useToast = () => useContext(ToastContext);

const TOAST_DURATION = 10000; // Duration of the toast in milliseconds (e.g., 10000ms for 10 seconds)
const UPDATE_INTERVAL = 10; // Update interval for the progress bar in milliseconds (e.g., 10ms)

type ToastProviderProps = {
  children: React.ReactNode;
};

export enum ToastType {
  Success = "success",
  Warning = "warning",
  Error = "error",
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(100);
  const [toastType, setToastType] = useState<ToastType>(ToastType.Success);

  const showToast = (msg: string, type: ToastType) => {
    setMessage(msg);
    setProgress(100);
    setToastType(type);

    const totalSteps = TOAST_DURATION / UPDATE_INTERVAL;
  };

  useEffect(() => {
    if (message) {
      const interval = setInterval(() => {
        // Update progress
        setProgress((prevProgress) => prevProgress - 100 / (TOAST_DURATION / UPDATE_INTERVAL));
      }, UPDATE_INTERVAL);
  
      const timeout = setTimeout(() => {
        setMessage(null);
        clearInterval(interval);
      }, TOAST_DURATION);
  
      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [message]);
  

  const dismissToast = () => {
    setMessage(null);
  };

  const renderMessage = (message: string) => {
    return message.split('\n').map((item, key) => (
      <Fragment key={key}>
        {item}
        <br />
      </Fragment>
    ));
  };

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case ToastType.Success:
        return ["bg-green-500", "bg-green-700"];
      case ToastType.Warning:
        return ["bg-yellow-500", "bg-yellow-700"]
      case ToastType.Error:
        return ["bg-red-500", "bg-red-700"]
      default:
        return ["bg-gray-500", "bg-gray-700"]
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className={`fixed bottom-5 right-5 ${getToastStyle(toastType)[0]} text-white py-2 px-4 rounded flex items-center justify-between`}>
          <span>{renderMessage(message)}</span>
          <button onClick={dismissToast} className="text-white ml-4">
            &#10005;
          </button>
          <div
            className={`absolute bottom-0 left-0 right-0 ${getToastStyle(toastType)[1]} h-1`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
    </ToastContext.Provider>
  );
};