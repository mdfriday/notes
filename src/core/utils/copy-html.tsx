export const copyHtmlWithStyle = async (elementId: string) => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error("Element not found");

    return;
  }

  // Clone the element and include all themes as inline themes
  const clone = element.cloneNode(true) as HTMLElement;

  const inlineStyles = (element: HTMLElement) => {
    const computedStyle = window.getComputedStyle(element);
    // Convert CSSStyleDeclaration to array of property names
    const properties = Array.from(computedStyle);

    for (const key of properties) {
      element.style[key as any] = computedStyle.getPropertyValue(key);
    }
  };

  // Apply inline themes recursively
  const applyStylesRecursively = (element: HTMLElement) => {
    inlineStyles(element);
    Array.from(element.children).forEach((child) =>
      applyStylesRecursively(child as HTMLElement),
    );
  };

  applyStylesRecursively(clone);

  // Get the HTML content as a string
  const htmlContent = clone.outerHTML;

  try {
    // Use Clipboard API to copy the HTML with inline themes
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([htmlContent], { type: "text/html" }),
      }),
    ]);
  } catch (error) {
    console.error("Failed to copy content with style:", error);
  }
};
