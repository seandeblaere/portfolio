import { useMobileContext } from "../../context/MobileContext";

export const MobileControls = () => {
  const { showMobileControls, nextPlanet, previousPlanet } = useMobileContext();

  return showMobileControls ? (
    <div className="mobile-controls">
      <img
        src="../../assets/arrow_left.svg"
        alt="Previous"
        width={48}
        height={48}
        onClick={previousPlanet}
      />
      <img
        src="../../assets/arrow_right.svg"
        alt="Next"
        width={48}
        height={48}
        onClick={nextPlanet}
      />
    </div>
  ) : null;
};
