"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { LogOut, UserIcon } from "lucide-react";
import UserAvatar from "./user-avatar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export function UserButton({ className }: { className?: string }) {
  const { data } = useSession();
  const user = data?.user;
  if (!user) return null;
  if (!user.image) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <div>
          <UserAvatar avatarUrl={user.image} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Signed In as @{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={"/users/" + user.email}>
          <DropdownMenuItem className="cursor-pointer">
            <UserIcon className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            signOut();
          }}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
