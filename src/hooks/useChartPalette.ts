import { useTheme } from "../context/ThemeContext";
import { chartPalette, chartPaletteDark } from "../constants/colors";

/** Returns the chart color palette appropriate for the current theme. */
export function useChartPalette() {
  const { mode } = useTheme();
  return mode === "dark" ? chartPaletteDark : chartPalette;
}
