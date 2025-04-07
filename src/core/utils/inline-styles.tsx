interface StyleRule {
  [property: string]: string;
}

interface StyleRules {
  [selector: string]: StyleRule;
}

export default function inlineStyles(html: string, css: string): string {
  if (!html || !css) {
    return html;
  }

  const tempDiv = document.createElement("div");

  tempDiv.innerHTML = html;

  const styleRules: StyleRules = {};

  // Parse CSS rules
  css.split("}").forEach((rule) => {
    const parts = rule.split("{");

    if (parts.length !== 2) return;

    const [selector, styles] = parts;

    if (!selector?.trim() || !styles?.trim()) return;

    const trimmedSelector = selector.trim();

    styleRules[trimmedSelector] = {};

    // Parse individual style properties
    styles.split(";").forEach((style) => {
      const [property, value] = style.split(":");

      if (property?.trim() && value?.trim()) {
        styleRules[trimmedSelector][property.trim()] = value.trim();
      }
    });
  });

  // Apply themes to matching elements
  try {
    Object.entries(styleRules).forEach(([selector, styles]) => {
      const elements = tempDiv.querySelectorAll(selector);

      elements.forEach((element) => {
        if (element instanceof HTMLElement) {
          Object.entries(styles).forEach(([property, value]) => {
            element.style.setProperty(property, value);
          });
        }
      });
    });
  } catch (error) {
    console.error("Error applying inline themes:", error);
  }

  return tempDiv.innerHTML;
}
