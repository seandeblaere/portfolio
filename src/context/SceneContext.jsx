import { createContext, useContext, useState, useEffect } from "react";

const SceneContext = createContext(null);

export function SceneProvider({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSpaceScene, setIsSpaceScene] = useState(false);
  const [remountKey, setRemountKey] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 768;
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        setRemountKey((prev) => prev + 1);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  return (
    <SceneContext.Provider
      value={{
        isMobile,
        isSpaceScene,
        setIsSpaceScene,
        remountKey,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}

export const useSceneContext = () => useContext(SceneContext);
