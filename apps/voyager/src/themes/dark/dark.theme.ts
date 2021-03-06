import { ThemeInterface } from "@/types";
import mapStyle from "./dark-theme.map.style.json";

const theme: ThemeInterface = {
  name: "dark",
  borderRadius: 2,
  isDark: true,
  statusBarStyle: "light",
  mapStyle,
  colors: {
    background: "#000",
    onBackground: "#fff",
    secondary: "#111",
    secondaryVariant: "#0C0057",
    onSecondary: "#fff",
    primary: "#0048B4",
    primaryVariant: "#002687",
    onPrimary: "#fff",
    surface: "#222",
    onSurface: "#ccc",
    success: "lime",
    onSuccess: "#fff",
    info: "#0384fc",
    onInfo: "#fff",
    warn: "#BFAF1D",
    onWarn: "#000",
    error: "#db232c",
    onError: "#fff",
  },
};

export default theme;
