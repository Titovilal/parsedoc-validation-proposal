'use client';
import { createContext, useContext, useState } from 'react';

export const ResourceContext = createContext({
  lowResourceMode: false,
  toggleLowResourceMode: () => {}
});

export function ResourceProvider({ children }) {
  const [lowResources, setLowResources] = useState(false);

  const toggleLowResourceMode = () => {
    setLowResources(prev => !prev);
  };

  return (
    <ResourceContext.Provider value={{ 
      lowResourceMode: lowResources, 
      toggleLowResourceMode 
    }}>
      {children}
    </ResourceContext.Provider>
  );
}

export const useResource = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResource must be used within a ResourceProvider');
  }
  return context;
}; 