'use client';
import { createContext, useContext, useState } from 'react';

const ResourceContext = createContext();

export function ResourceProvider({ children }) {
  const [lowResources, setLowResources] = useState(false);

  return (
    <ResourceContext.Provider value={{ lowResources, setLowResources }}>
      {children}
    </ResourceContext.Provider>
  );
}

export const useResource = () => useContext(ResourceContext); 