// client/src/components/locations/LocationContext.jsx 
import React, { createContext, useState } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    search: '',
    district: '',
    sortBy: 'name',
    maxDistance: ''
  });

  return (
    <LocationContext.Provider value={{ filters, setFilters }}>
      {children}
    </LocationContext.Provider>
  );
};