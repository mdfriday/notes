import { useState } from "react";
import { createContainer } from "unstated-next";

import { loadCSS, markdownStyles } from "@/config/post-styles.ts";
import { loadTemplate, templateExamples } from "@/config/post-template.ts";

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

  return {
    selectedStyle,
    setSelectedStyle,
    articleStyle,
    setArticleStyle,
    selectedTemplate,
    setSelectedTemplate,
    template,
    setTemplate,
  };
};

export const ToolbarState = createContainer(useToolbarState);
