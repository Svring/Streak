import { createContext, useContext, RefObject } from 'react';

type FrameContextType = {
  frameRef: RefObject<HTMLDivElement> | null;
};

export const FrameContext = createContext<FrameContextType>({ frameRef: null });

export const useFrame = () => {
  const context = useContext(FrameContext);
  if (!context) {
    throw new Error('useFrame must be used within a FrameProvider');
  }
  return context;
}; 