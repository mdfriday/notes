import React from "react";
import { Button, ButtonGroup } from "@nextui-org/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/dropdown";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";
import { Download } from "lucide-react";

import { ChevronDownIcon } from "@/components/icons.tsx";
import { isSafari } from "@/core/utils/is-safari.ts";

interface DownloadButtonGroupProps {
  markdown: string;
}

export default function DownloadButtonGroup({ markdown }: DownloadButtonGroupProps) {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = React.useState<any>(
    new Set(["image"]),
  );

  const descriptionsMap: any = {
    image: t("downloadImage.buttonDescription"),
    pdf: t("downloadPDF.buttonDescription"),
    html: t("downloadHTML.buttonDescription"),
    markdown: t("downloadMarkdown.buttonDescription"),
  };

  const labelsMap: any = {
    image: t("downloadImage.buttonName"),
    pdf: t("downloadPDF.buttonName"),
    html: t("downloadHTML.buttonName"),
    markdown: t("downloadMarkdown.buttonName"),
  };

  const selectedOptionValue: any = Array.from(selectedOption)[0];

  const handleDownloadButtonClick = async () => {
    const element = document.getElementById("markdown-body");

    if (!element) {
      return;
    }

    if (selectedOption.has("pdf")) {
      toast.success(t("commonToast.developing"), {
        duration: 4000,
        position: "top-center",
      });
    } else if (selectedOption.has("image")) {
      toast.success(t("commonToast.processing"), {
        duration: 4000,
        position: "top-center",
      });

      try {
        if (isSafari) {
          // workaround to fix image missing in Safari
          await htmlToImage.toPng(element);
          await htmlToImage.toPng(element);
        }

        const dataUrl = await htmlToImage.toPng(element);

        const link = document.createElement("a");

        link.download = "markdown-post.png";
        link.href = dataUrl;
        link.click();
        toast.success(t("downloadImage.successMessage"), {
          description: t("downloadImage.successDescription"),
          duration: 4000,
          position: "top-center",
        });
      } catch (error) {
        console.error("oops, something went wrong!", error);
        toast.error(t("downloadImage.failedMessage"));
      }
    } else if (selectedOption.has("html")) {
      try {
        const htmlContent = element.outerHTML;
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "markdown-post.html";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(t("downloadHTML.successMessage"), {
          description: t("downloadHTML.successDescription"),
          duration: 4000,
          position: "top-center",
        });
      } catch (error) {
        console.error("Failed to download HTML:", error);
        toast.error(t("downloadHTML.failedMessage"));
      }
    } else if (selectedOption.has("markdown")) {
      try {
        const blob = new Blob([markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "markdown-post.md";
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(t("downloadMarkdown.successMessage"), {
          description: t("downloadMarkdown.successDescription"),
          duration: 4000,
          position: "top-center",
        });
      } catch (error) {
        console.error("Failed to download Markdown:", error);
        toast.error(t("downloadMarkdown.failedMessage"));
      }
    }
  };

  return (
    <ButtonGroup className="w-full" variant="flat">
      <Button className="h-[40px] w-full" onClick={handleDownloadButtonClick}>
        <Download size={18} />
        {labelsMap[selectedOptionValue]}
      </Button>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button isIconOnly className="h-[40px]">
            <ChevronDownIcon />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          disallowEmptySelection
          aria-label="Merge options"
          className="max-w-[300px]"
          selectedKeys={selectedOption}
          selectionMode="single"
          onSelectionChange={setSelectedOption}
        >
          <DropdownItem key="image" description={descriptionsMap["image"]}>
            {labelsMap["image"]}
          </DropdownItem>
          <DropdownItem key="html" description={descriptionsMap["html"]}>
            {labelsMap["html"]}
          </DropdownItem>
          <DropdownItem key="markdown" description={descriptionsMap["markdown"]}>
            {labelsMap["markdown"]}
          </DropdownItem>
          <DropdownItem key="pdf" description={descriptionsMap["pdf"]}>
            {labelsMap["pdf"]}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </ButtonGroup>
  );
}
