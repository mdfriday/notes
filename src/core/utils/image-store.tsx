const imageStore: Record<string, string> = {};

export function saveImageBase64(base64String: string): string {
  const imageId = generateImageId();

  imageStore[imageId] = base64String;

  return imageId;
}

function loadImageBase64(imageId: string): string | undefined {
  return imageStore[imageId];
}

export function replaceImgSrc(html: string): string {
  // Return original html if no localStorage image references found
  if (!html.includes("browser://")) {
    return html;
  }

  // Regular expression to match img tags with ls:// protocol
  const imgRegex = /<img[^>]*src="browser:\/\/([^"]+)"[^>]*>/g;

  // Replace all matching img tags
  return html.replace(imgRegex, (match, imgKey) => {
    const base64Data = loadImageBase64(imgKey);

    if (base64Data) {
      // Replace only the src attribute value
      return match.replace(`browser://${imgKey}`, base64Data);
    }

    // If no base64 data found, return original img tag
    return match;
  });
}

export function createMarkdownImage(imageId: string): string {
  return `![Image](browser://${imageId})`;
}

export function generateImageId(): string {
  return "img_" + Math.random().toString(36).substr(2, 9);
}
