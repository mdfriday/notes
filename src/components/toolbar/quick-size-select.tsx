import React, { useState, useEffect } from "react";
import { Button } from "@nextui-org/button";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react"; 

import { ToolbarState, rightPaneSizes } from "@/core/state/toolbarState";

const QuickSizeSelect: React.FC = () => {
  const { t } = useTranslation();
  const { rightPaneWidth, setRightPaneWidth } = ToolbarState.useContainer();
  
  // Track which size was last selected for visual feedback
  const [lastSelected, setLastSelected] = useState<string | null>(null);
  
  // Reset the last selected if rightPaneWidth is 0
  useEffect(() => {
    if (rightPaneWidth === 0) {
      setLastSelected(null);
    }
  }, [rightPaneWidth]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="flat" 
          className="w-full h-[40px] justify-between"
          endContent={<ChevronDown size={16} />}
        >
          {t("toolbar.quickSizeText")}
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label={t("toolbar.quickSizeText")}
        onAction={(key) => {
          const selectedKey = key as string;
          const selectedSize = rightPaneSizes.find(size => size.name === selectedKey);
          
          if (selectedSize) {
            // Set the width through the ToolbarState
            setRightPaneWidth(selectedSize.value);
            
            // Update our local state for visual feedback
            setLastSelected(selectedKey);
            
            // Force regeneration of right pane width to ensure it's applied
            setTimeout(() => {
              // This will help ensure resize calculations happen when the DOM has updated
              window.dispatchEvent(new Event('resize'));
            }, 10);
          }
        }}
        selectedKeys={lastSelected ? [lastSelected] : []}
        selectionMode="single"
      >
        {rightPaneSizes.map((size) => (
          <DropdownItem key={size.name}>
            {size.name === "default" 
              ? t("toolbar.defaultSize") 
              : `${size.value}px`}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default QuickSizeSelect; 