import React, { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { ChromePicker } from "react-color";
import { Slider } from "@nextui-org/slider";
import { useTranslation } from "react-i18next";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";

import { ToolbarState, rightPaneSizes } from "@/core/state/toolbarState.ts";
import {
  cssToRecord,
  extractContainerLayoutContent,
  objectToStyleString,
} from "@/core/utils/styletransfer.ts";

const ColorBox = ({
  newStyle,
  setNewStyle,
}: {
  newStyle: Record<string, string>;
  setNewStyle: (newStyle: Record<string, string>) => void;
}) => {
  return (
    <Popover showArrow offset={10} placement="bottom" shouldBlockScroll={true}>
      <PopoverTrigger>
        <div
          className={`size-6 rounded-full flex-shrink-0`}
          style={{ backgroundColor: newStyle["background-color"] }}
        />
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <ChromePicker
          color={newStyle["background-color"]}
          disableAlpha={true}
          onChange={(color) => {
            setNewStyle({
              ...newStyle,
              ["background-color"]: `${color.hex}`,
              ["background"]: `${color.hex}`,
            });
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export const StyleSettingPopoverContent = () => {
  const { t } = useTranslation();

  const { articleStyle, setArticleStyle, setRightPaneWidth } = ToolbarState.useContainer();

  const [newStyle, setNewStyle] = useState<Record<string, string>>(
    cssToRecord(extractContainerLayoutContent(articleStyle)),
  );

  useEffect(() => {
    if (objectToStyleString(newStyle)) {
      setArticleStyle((prev) => {
        return prev.replace(
          extractContainerLayoutContent(prev),
          objectToStyleString(newStyle),
        );
      });
    }
  }, [newStyle]);

  // Handler for preview width selection
  const handleWidthSelect = (width: number) => {
    // Set the width through the ToolbarState
    setRightPaneWidth(width);
    
    // Force regeneration of right pane width to ensure it's applied
    setTimeout(() => {
      // This will help ensure resize calculations happen when the DOM has updated
      window.dispatchEvent(new Event('resize'));
    }, 10);
  };

  return (
    <PopoverContent className="w-[360px]">
      {(titleProps) => (
        <div className="px-1 py-2 w-full">
          <p
            className="text-small font-bold text-foreground pb-3"
            {...titleProps}
          >
            {t(`customize.layoutCustomizer`)}
          </p>
          <Input
            label={t("customize.containerBackground")}
            labelPlacement="outside"
            startContent={
              <div style={{ cursor: "pointer" }}>
                <ColorBox newStyle={newStyle} setNewStyle={setNewStyle} />
              </div>
            }
            value={newStyle["background-color"]}
            onChange={(e) => {
              setNewStyle({
                ...newStyle,
                ["background-color"]: `${e.target.value}`,
                ["background"]: `${e.target.value}`,
              });
            }}
          />
          <div className="mt-4 flex flex-col gap-3 w-full">
            <Slider
              className="max-w-md"
              defaultValue={Number(newStyle["padding"].slice(0, -2)) || 16}
              getValue={(donuts) => `${donuts}px`}
              label={t(`customize.containerPadding`)}
              maxValue={64}
              minValue={0}
              step={4}
              onChange={(value) => {
                setNewStyle({
                  ...newStyle,
                  ["padding"]: `${value}px`,
                });
              }}
            />
          </div>
          
          {/* Preview Width Options */}
          <div className="mt-4">
            <p className="text-small font-medium mb-2">{t("toolbar.quickSizeText")}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="flat"
                onClick={() => handleWidthSelect(0)}
              >
                {t("toolbar.defaultSize")}
              </Button>
              {rightPaneSizes.filter(size => size.name !== "default").map((size) => (
                <Button
                  key={size.name}
                  size="sm"
                  variant="flat"
                  onClick={() => handleWidthSelect(size.value + 40)}
                >
                  {`${size.value}px`}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </PopoverContent>
  );
};
