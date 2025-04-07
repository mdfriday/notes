import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import { Select, SelectItem } from "@nextui-org/select";
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/navbar";
import { useTranslation } from "react-i18next";
import { link as linkStyles } from "@nextui-org/theme";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import LangButton from "@/components/lang-button.tsx";
import StyleSettingPopover from "@/components/toolbar/style-setting-popover.tsx";
import CopyButtonGroup from "@/components/toolbar/copy-button-group.tsx";
import DownloadButtonGroup from "@/components/toolbar/download-button-group.tsx";
import { ToolbarState } from "@/core/state/toolbarState";
import { loadCSS, markdownStyles } from "@/config/post-styles.ts";
import { loadTemplate, templateExamples } from "@/config/post-template.ts";
import { useEffect } from "react";

interface IntegratedNavbarProps {
  markdown: string;
}

export const IntegratedNavbar: React.FC<IntegratedNavbarProps> = ({ markdown }) => {
  const { t, i18n } = useTranslation();
  const { 
    selectedStyle, 
    setSelectedStyle, 
    setArticleStyle,
    selectedTemplate, 
    setSelectedTemplate, 
    setTemplate 
  } = ToolbarState.useContainer();

  useEffect(() => {
    setArticleStyle(loadCSS(selectedStyle) as string);
  }, [selectedStyle]);

  useEffect(() => {
    setTemplate(loadTemplate(selectedTemplate) as string);
  }, [selectedTemplate]);

  return (
    <NextUINavbar 
      maxWidth="full" 
      position="sticky" 
      className="px-4 shadow-sm"
    >
      {/* 左侧导航部分 */}
      <NavbarContent className="basis-auto" justify="start">
        <NavbarBrand className="gap-2 max-w-fit mr-4">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
            <p className="font-bold text-inherit">MDFriday Notes</p>
          </Link>
        </NavbarBrand>

        <div className="flex gap-2 justify-start items-center">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* 中部工具栏 */}
      {/*<NavbarContent */}
      {/*  className="flex-1 gap-2 items-center justify-center" */}
      {/*  justify="center"*/}
      {/*>*/}
        {/*<Select*/}
        {/*  className="max-w-[200px]"*/}
        {/*  size="sm"*/}
        {/*  disallowEmptySelection={true}*/}
        {/*  aria-label={t("toolbar.selectStyleText")}*/}
        {/*  labelPlacement="outside-left"*/}
        {/*  selectedKeys={[selectedStyle]}*/}
        {/*  onChange={(e) => setSelectedStyle(e.target.value)}*/}
        {/*>*/}
        {/*  {markdownStyles.map((style) => (*/}
        {/*    <SelectItem key={style.name} value={style.name}>*/}
        {/*      {t(`postStyle.${style.name}`)}*/}
        {/*    </SelectItem>*/}
        {/*  ))}*/}
        {/*</Select>*/}

        {/*<Select*/}
        {/*  className="max-w-[220px]"*/}
        {/*  size="sm"*/}
        {/*  disallowEmptySelection={true}*/}
        {/*  aria-label={t("toolbar.selectTemplateText")}*/}
        {/*  labelPlacement="outside-left"*/}
        {/*  selectedKeys={[selectedTemplate]}*/}
        {/*  onChange={(e) => setSelectedTemplate(e.target.value)}*/}
        {/*>*/}
        {/*  {templateExamples.map((style) => (*/}
        {/*    <SelectItem key={style.name} value={style.name}>*/}
        {/*      {t(`templateName.${style.name}`)}*/}
        {/*    </SelectItem>*/}
        {/*  ))}*/}
        {/*</Select>*/}
      {/*</NavbarContent>*/}

      {/* 右侧工具和用户功能区 */}
      <NavbarContent 
        justify="end" 
        className="gap-2"
      >

        <Select
            className="max-w-[200px]"
            size="sm"
            disallowEmptySelection={true}
            aria-label={t("toolbar.selectStyleText")}
            labelPlacement="outside-left"
            selectedKeys={[selectedStyle]}
            onChange={(e) => setSelectedStyle(e.target.value)}
        >
          {markdownStyles.map((style) => (
              <SelectItem key={style.name} value={style.name}>
                {t(`postStyle.${style.name}`)}
              </SelectItem>
          ))}
        </Select>

        <NavbarItem>
          <StyleSettingPopover />
        </NavbarItem>
        
        <NavbarItem>
          <CopyButtonGroup />
        </NavbarItem>
        
        <NavbarItem>
          <DownloadButtonGroup markdown={markdown} />
        </NavbarItem>
        
        {/*<NavbarItem>*/}
        {/*  <LangButton />*/}
        {/*</NavbarItem>*/}
      </NavbarContent>
    </NextUINavbar>
  );
};

export default IntegratedNavbar; 