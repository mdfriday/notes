import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Button } from "@nextui-org/button";
import { LangIcon } from "@/components/icons.tsx";
import { useNavigate } from "react-router-dom";

const LangButton = () => {
  const navigate = useNavigate();

  const handleLanguageSelected = (lang: any) => {
    const pathSegments = location.pathname.split("/");

    pathSegments[1] = lang;
    navigate(pathSegments.join("/"), { replace: true });
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly={true} variant="light">
          <LangIcon />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Static Actions"
        disallowEmptySelection
        // selectionMode="single"
        onAction={handleLanguageSelected}
      >
        <DropdownItem key="zh">中文</DropdownItem>
        <DropdownItem key="en">English</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default LangButton;
