import { createContext, useContext, useState } from "react";

const MobileContext = createContext(null);

export function MobileProvider({ children }) {
  const [activePlanetIndex, setActivePlanetIndex] = useState(0);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const isMobile = window.innerWidth < 768;

  const nextPlanet = () => {
    console.log("nextPlanet");
    setActivePlanetIndex((prev) => (prev + 1) % 4);
  };

  const previousPlanet = () => {
    console.log("previousPlanet");
    setActivePlanetIndex((prev) => (prev - 1 + 4) % 4);
  };

  return (
    <MobileContext.Provider
      value={{
        activePlanetIndex,
        showMobileControls,
        isMobile,
        nextPlanet,
        previousPlanet,
        setShowMobileControls,
      }}
    >
      {children}
    </MobileContext.Provider>
  );
}

export const useMobileContext = () => useContext(MobileContext);
