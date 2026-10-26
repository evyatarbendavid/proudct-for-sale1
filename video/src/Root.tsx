import { Composition } from "remotion";
import { DURATION, FPS, H, Promo, W } from "./Promo";

export const RemotionRoot = () => (
  <Composition id="Promo" component={Promo} durationInFrames={DURATION} fps={FPS} width={W} height={H} />
);
