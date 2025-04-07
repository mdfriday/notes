import githubStyle from "@/data/themes/github.css?raw";
import newspaperStyle from "@/data/themes/newspaper.css?raw";
import posterStyle from "@/data/themes/poster.css?raw";
import slimStyle from "@/data/themes/slim.css?raw";
import noteStyle from "@/data/themes/note.css?raw";
import twStyle from "@/data/themes/thoughtworks.css?raw";

export const markdownStyles = [
  { name: "github", css: githubStyle },
  { name: "newspaper", css: newspaperStyle },
  { name: "poster", css: posterStyle },
  { name: "slim", css: slimStyle },
  { name: "note", css: noteStyle },
  { name: "tw", css: twStyle },
];

export const loadCSS: any = (name: string) =>
  markdownStyles.find((style) => style.name === name)?.css;
