import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatForDisplay, useHotkey } from "@tanstack/react-hotkeys";
import {
  Building2,
  ChevronDown,
  ClipboardList,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { Brand } from "../../shared/ui/Brand";
import { Button } from "../../shared/ui/Button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../../shared/ui/Command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../shared/ui/DropdownMenu";
import { Kbd } from "../../shared/ui/Kbd";

type AppHeaderProps = {
  context?: string;
};

export function AppHeader({ context }: AppHeaderProps) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const navigate = useNavigate();

  useHotkey("Mod+K", (event) => {
    event.preventDefault();
    setIsCommandOpen((open) => !open);
  });

  function navigateTo(path: string) {
    navigate(path);
    setIsCommandOpen(false);
  }

  return (
    <header className="flex items-center justify-between gap-3 rounded-md bg-surface p-2 max-sm:flex-col max-sm:items-start max-sm:p-3">
      <Brand context={context} onClick={() => navigateTo("/")} />
      <div className="flex items-center gap-2 max-sm:w-full">
        <Button
          variant="transparent"
          size="sm"
          className="min-w-52 justify-between bg-neutral-100 text-secondary max-sm:min-w-0 max-sm:flex-1"
          onClick={() => setIsCommandOpen(true)}
          aria-label="Open command menu"
        >
          <span className="flex items-center text-text-muted text-sm gap-2">
            <Search size={16} /> Search
          </span>
          <Kbd>{formatForDisplay("Mod+K")}</Kbd>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="transparent"
                size="sm"
                className="gap-2 px-1.5"
                aria-label="Open lab workspace menu"
              />
            }
          >
            <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              AM
            </span>
            <span className="hidden min-w-24 text-left sm:grid">
              <span className="text-sm font-semibold normal-case text-text">
                Maya Lab
              </span>
              <span className="text-xs font-normal normal-case text-text-muted">
                Admin workspace
              </span>
            </span>
            <ChevronDown size={16} className="text-text-muted" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="block text-sm font-semibold text-text">
                  Maya Lab
                </span>
                <span className="mt-0.5 block text-xs font-normal text-text-muted">
                  Production workspace
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigateTo("/")}>
                <LayoutDashboard /> Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo("/cases")}>
                <ClipboardList /> Case pipeline
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo("/doctors-clinics")}>
                <Building2 /> Doctors & clinics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateTo("/appliances")}>
                <SlidersHorizontal /> Appliances & fields
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <UserRound /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Keyboard /> Keyboard shortcuts
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <LogOut /> Sign out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <Command>
          <CommandInput placeholder="Search workspace..." autoFocus />
          <CommandList>
            <CommandEmpty>No matching actions.</CommandEmpty>
            <CommandGroup heading="Navigate">
              <CommandItem onSelect={() => navigateTo("/")}>
                <LayoutDashboard /> Dashboard{" "}
                <CommandShortcut>G D</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/doctors-clinics")}>
                <Building2 /> Doctors & clinics
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/cases")}>
                <ClipboardList /> Case pipeline{" "}
                <CommandShortcut>G C</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => navigateTo("/appliances")}>
                <SlidersHorizontal /> Appliances & fields
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Account">
              <CommandItem onSelect={() => setIsCommandOpen(false)}>
                <Settings /> Settings
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </header>
  );
}
