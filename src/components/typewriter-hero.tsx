import { TypewriterEffectSmooth } from "@/components/typewriter";
import { useTranslation } from "react-i18next";

export function TypewriterHero() {
  const enWords = [
    {
      text: "Write",
    },
    {
      text: "Markdown",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "And",
    },
    {
      text: "Post",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "Everywhere.",
    },
  ];

  const zhWords = [
    {
      text: "创作",
    },
    {
      text: "Markdown",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "，随处",
    },
    {
      text: "分享",
      className: "text-blue-500 dark:text-blue-500",
    },
    {
      text: "。",
    },
  ];

  const { i18n } = useTranslation();

  return (
    <div className="flex justify-center items-center">
      <TypewriterEffectSmooth
        key={i18n.language}
        words={i18n.language === "zh" ? zhWords : enWords}
      />
    </div>
  );
}
