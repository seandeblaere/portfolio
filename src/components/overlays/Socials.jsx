import { useSceneContext } from "../../context/SceneContext.jsx";

export const Socials = () => {
  const { isSpaceScene, isMobile } = useSceneContext();

  if (!isSpaceScene || isMobile) return null;

  return (
    <div className="overlay">
      <a href="https://github.com/seandeblaere" target="_blank">
        <img
          src="./assets/github-white.svg"
          alt="GitHub"
          width={32}
          height={32}
        />
      </a>
      <a href="mailto:seandebl@student.arteveldehs.be">
        <img
          src="./assets/email-white.svg"
          alt="Email"
          width={32}
          height={32}
        />
      </a>
    </div>
  );
};
