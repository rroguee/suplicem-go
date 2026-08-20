import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext({
  isLoading: false,
  show: () => {},
  hide: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const show = () => setIsLoading(true);
  const hide = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, show, hide }}>
      {children}
    </LoadingContext.Provider>
  );
};
