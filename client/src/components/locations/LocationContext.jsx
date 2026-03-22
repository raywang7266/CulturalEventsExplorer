/*
Student Name : QIAN Ziyue
Student ID   : 1155233243
Student Name : ZHU Chunxuan
Student ID   : 1155233366
Student Name : XIONG Meini
Student ID   : 1155233445
Student Name : WANG Ziji
Student ID   : 1155233196
Student Name : WANG Yiran
Student ID   : 1155233101
*/
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