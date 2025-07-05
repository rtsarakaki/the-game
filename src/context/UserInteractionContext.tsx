"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

const UserInteractionContext = createContext(false);

export const UserInteractionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => setHasUserInteracted(true);
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return (
    <UserInteractionContext.Provider value={hasUserInteracted}>
      {children}
    </UserInteractionContext.Provider>
  );
};

export const useUserInteraction = () => useContext(UserInteractionContext); 