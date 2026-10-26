import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setChromiumOpenGlRenderer("swangle");

// המודל של השעון נמצא ב-lib של האתר. מוודאים שהוא משתמש באותו three של הסרטון
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      three: path.resolve(process.cwd(), "node_modules/three"),
    },
  },
}));
