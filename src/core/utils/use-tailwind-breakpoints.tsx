import { useLayoutEffect, useState } from "react";
import { useWindowSize } from "@/core/utils/use-window-size.tsx";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

const useTailwindBreakpoints = () => {
  const [activeBreakpoints, setActiveBreakpoints] = useState(new Set<string>());
  const { width } = useWindowSize();

  useLayoutEffect(() => {
    if (width === null) return;

    const newSet = new Set<string>();

    if (width < breakpoints["2xl"]) {
      newSet.add("2xl");
    }
    if (width < breakpoints.xl) {
      newSet.add("xl");
    }
    if (width < breakpoints.lg) {
      newSet.add("lg");
    }
    if (width < breakpoints.md) {
      newSet.add("md");
    }
    if (width < breakpoints.sm) {
      newSet.add("sm");
    }

    setActiveBreakpoints(newSet);
  }, [width]);

  return activeBreakpoints;
};

export default useTailwindBreakpoints;
