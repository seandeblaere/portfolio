import { useSceneContext } from "../../context/SceneContext.jsx";
import { useState, useEffect } from "react";

export const Swipe = () => {
  const { isSpaceScene, isMobile } = useSceneContext();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!isSpaceScene || !isMobile) return;
    setHidden(false);
    setTimeout(() => {
      setHidden(true);
    }, 6000);
  }, [isSpaceScene, isMobile]);

  if (!isSpaceScene || !isMobile) return null;

  return (
    <div className={`swipe ${hidden ? "hidden" : ""}`}>
      <img src="./assets/swipe.png" alt="Swipe" width={48} height={48} />
    </div>
  );
};
