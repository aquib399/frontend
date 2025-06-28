"use client";

import { Dot, LogOut, Monitor, Moon, Sun, UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import UserAvatar from "./user-avatar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuSub,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";

export function UserButton({ className }: { className?: string }) {
  const { data } = useSession();
  const user = data?.user;
  if (!user || !user.image) {
    return null; // or a fallback UI
  }
  const { theme, setTheme } = useTheme();
  console.log("Current theme:", theme);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <div>
          <UserAvatar avatarUrl={user?.image} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Signed In as @{user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={"/users/" + user?.email}>
          <DropdownMenuItem className="cursor-pointer">
            <UserIcon className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            {
              {
                system: <Monitor className="mr-2 size-4" />,
                light: <Sun className="mr-2 size-4" />,
                dark: <Moon className="mr-2 size-4" />,
              }[theme as string]
            }
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="cursor-pointer"
              >
                <Monitor className="mr-2 size-4" />
                System default
                {theme === "system" && <Dot />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="cursor-pointer"
              >
                <Sun className="mr-2 size-4" />
                Light
                {theme === "light" && <Dot />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="cursor-pointer"
              >
                <Moon className="mr-2 size-4" />
                Dark
                {theme === "dark" && <Dot />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {}} className="cursor-pointer">
          <LogOut className="mr-2 size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
