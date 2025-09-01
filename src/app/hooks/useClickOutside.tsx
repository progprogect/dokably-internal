import React from 'react';

export const useClickOutside = <T,>(
  initialValue: T | null,
  callback?: () => void,
  eventType = 'mousedown',
) => {
  const [isVisible, setIsVisible] = React.useState<T | null>(initialValue);
  const ref = React.useRef<any>(null);
  
  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isVisible && ref.current && !ref.current.contains(event.target)) {
        setIsVisible(null);
        callback?.();
      }
    };

    if (isVisible) {
      document.addEventListener(eventType, handleClickOutside);
      
      return () => {
        document.removeEventListener(eventType, handleClickOutside);
      };
    }
  }, [isVisible, callback, eventType]);

  return { ref, isVisible, setIsVisible };
};
