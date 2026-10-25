import { Composition } from "remotion";
import { ThoughtfulScene } from "./ThoughtfulScene";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ThoughtfulCloseup"
    component={ThoughtfulScene}
    durationInFrames={60}
    fps={30}
    width={1920}
    height={1080}
  />
);
