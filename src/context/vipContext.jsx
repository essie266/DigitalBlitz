import React, { createContext, useState } from "react";

export const VIPContext = createContext();

export const VIPProvider = ({ children }) => {
  const [vipLevel, setVipLevel] = useState(1); // Default VIP 1

  const upgradeVIP = () => {
    setVipLevel((prev) => prev + 1);
  };

  return (
    <VIPContext.Provider value={{ vipLevel, upgradeVIP }}>
      {children}
    </VIPContext.Provider>
  );
};