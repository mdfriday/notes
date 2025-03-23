import cardBanner from "@/data/card-banner.md?raw";
import formulaSingle from "@/data/formula-single.md?raw";
import formulaPair from "@/data/formula-pair.md?raw";
import formulaFlow from "@/data/formula-flow.md?raw";

export const templateExamples = [
  { name: "empty", md: "" },
  { name: "cardBanner", md: cardBanner },
  { name: "formulaSingle", md: formulaSingle },
  { name: "formulaPair", md: formulaPair },
  { name: "formulaFlow", md: formulaFlow },
];

export const loadTemplate: any = (name: string) =>
    templateExamples.find((style) => style.name === name)?.md;
