import { useState } from "react";
import { createContainer } from "unstated-next";

import { loadCSS, markdownStyles } from "@/config/post-styles.ts";
import { loadTemplate, templateExamples } from "@/config/post-template.ts";

// Define preset right pane sizes
export const rightPaneSizes = [
  { name: "default", value: 0 }, // 0 means use the split pane default
  { name: "1080p", value: 1080 },
  { name: "720p", value: 720 },
  { name: "540p", value: 540 },
  { name: "360p", value: 360 },
];

const useToolbarState = () => {
  const [selectedStyle, setSelectedStyle] = useState<string>(
    markdownStyles[0].name,
  );

  const [articleStyle, setArticleStyle] = useState<string>(
    loadCSS(selectedStyle) as string,
  );

  const [selectedTemplate, setSelectedTemplate] = useState<string>(
      templateExamples[0].name,
  );

  const [template, setTemplate] = useState<string>(
      loadTemplate(selectedTemplate) as string,
  );

  // Initial value is 0, meaning use the default resize behavior
  const [rightPaneWidth, setRightPaneWidth] = useState<number>(0);

  return {
    selectedStyle,
    setSelectedStyle,
    articleStyle,
    setArticleStyle,
    selectedTemplate,
    setSelectedTemplate,
    template,
    setTemplate,
    rightPaneWidth,
    setRightPaneWidth,
  };
};

export const ToolbarState = createContainer(useToolbarState);
