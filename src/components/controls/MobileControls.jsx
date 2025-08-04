import { useMobileContext } from "../../context/MobileContext";

export const MobileControls = () => {
  const { showMobileControls, nextPlanet, previousPlanet } = useMobileContext();

  return showMobileControls ? (
    <div className="mobile-controls">
      <button className="mobile-control-button" onClick={previousPlanet}>
        Previous
      </button>
      <button className="mobile-control-button" onClick={nextPlanet}>
        Next
      </button>
    </div>
  ) : null;
};
