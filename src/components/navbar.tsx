import { Button } from "@nextui-org/button";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { link as linkStyles } from "@nextui-org/theme";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
} from "@/components/icons";
import { Logo } from "@/components/icons";
import LangButton from "@/components/lang-button.tsx";
import SearchInput from './SearchInput';

// Define proper types for nav items
interface NavItem {
  label: string;
  href: string;
}

export const Navbar = () => {
  const searchInput = (
    <SearchInput 
      showKeyboardShortcut={true}
      className="w-full"
      placeholder="Search..."
    />
  );

  return (
    <NextUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
            <p className="font-bold text-inherit">MDFriday Notes</p>
          </Link>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item: NavItem) => (
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

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          {/*<Link isExternal href={siteConfig.links.twitter} title="Twitter">*/}
          {/*  <TwitterIcon className="text-default-500" />*/}
          {/*</Link>*/}
          {/*<Link isExternal href={siteConfig.links.discord} title="Discord">*/}
          {/*  <DiscordIcon className="text-default-500" />*/}
          {/*</Link>*/}
          <LangButton />
          {/*<Link isExternal href={siteConfig.links.github} title="GitHub">*/}
          {/*  <GithubIcon className="text-default-500" />*/}
          {/*</Link>*/}
          {/*<ThemeSwitch />*/}
        </NavbarItem>
        {/*<NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>*/}
        {/*<NavbarItem className="hidden md:flex">*/}
        {/*  <Button*/}
        {/*    isExternal*/}
        {/*    as={Link}*/}
        {/*    className="text-sm font-normal text-default-600 bg-default-100"*/}
        {/*    href={siteConfig.links.sponsor}*/}
        {/*    startContent={<HeartFilledIcon className="text-danger" />}*/}
        {/*    variant="flat"*/}
        {/*  >*/}
        {/*    Sponsor*/}
        {/*  </Button>*/}
        {/*</NavbarItem>*/}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <LangButton />
        {/*<Link isExternal href={siteConfig.links.github}>*/}
        {/*  <GithubIcon className="text-default-500" />*/}
        {/*</Link>*/}
        {/*<ThemeSwitch />*/}
        {/*<NavbarMenuToggle />*/}
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item: NavItem, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href={item.href}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
