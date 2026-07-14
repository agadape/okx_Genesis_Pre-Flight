import { Composition } from "remotion";
import { MainVideo } from "./Composition";
import "./index.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PreFlightCinema"
        component={MainVideo}
        durationInFrames={1950} // 65 seconds
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
