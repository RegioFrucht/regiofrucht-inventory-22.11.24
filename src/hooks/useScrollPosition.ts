import { useRef, useEffect } from 'react';

export const useScrollPosition = (dependencies: any[] = []) => {
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, 100);
    return () => clearTimeout(timer);
  }, dependencies);

  const saveScrollPosition = () => {
    scrollPositionRef.current = window.scrollY;
  };

  return { saveScrollPosition };
};