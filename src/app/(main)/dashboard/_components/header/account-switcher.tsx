"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Bell, Camera, Check, CircleUser, CreditCard, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";
import { useUserProfile } from "@/hooks/use-user-profile";
import { AvatarUploadDialog } from "@/components/avatar-upload-dialog";

export function AccountSwitcher({
  users,
}: {
  readonly users: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly avatar: string;
    readonly role: string;
  }>;
}) {
  const { profile: liveProfile, updateAvatar } = useUserProfile();
  const [activeUser, setActiveUser] = useState(users[0]);

  if (!activeUser) {
    return null;
  }

  const isCurrentActiveRoot = activeUser.id === "1";
  const displayAvatar = isCurrentActiveRoot ? liveProfile.avatar || activeUser.avatar : activeUser.avatar;
  const displayName = isCurrentActiveRoot ? liveProfile.name || activeUser.name : activeUser.name;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 rounded-lg cursor-pointer">
          <AvatarImage src={displayAvatar || undefined} alt={displayName} className="object-cover" />
          <AvatarFallback className="rounded-lg">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        {users.map((user) => {
          const uAvatar = user.id === "1" ? liveProfile.avatar || user.avatar : user.avatar;
          const uName = user.id === "1" ? liveProfile.name || user.name : user.name;
          return (
            <DropdownMenuItem
              key={user.email}
              className={cn("p-0", user.id === activeUser.id && "bg-accent/50")}
              aria-current={user.id === activeUser.id ? "true" : undefined}
              onClick={() => setActiveUser(user)}
            >
              <div className="flex w-full items-center gap-2 px-1 py-1.5">
                <Avatar className="size-9 rounded-lg">
                  <AvatarImage src={uAvatar || undefined} alt={uName} className="object-cover" />
                  <AvatarFallback className="rounded-lg">{getInitials(uName)}</AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{uName}</span>
                  <span className="truncate text-xs capitalize">{user.role}</span>
                </div>
                <span
                  className={cn(
                    "mr-1 flex size-5 items-center justify-center rounded-full text-primary opacity-0",
                    user.id === activeUser.id && "opacity-100",
                  )}
                >
                  <Check aria-hidden="true" />
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <AvatarUploadDialog
            currentAvatar={displayAvatar}
            userName={displayName}
            onAvatarChange={updateAvatar}
          >
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
              <Camera className="size-4" />
              Tukar Gambar Profil
            </DropdownMenuItem>
          </AvatarUploadDialog>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile" className="flex items-center gap-2">
              <CircleUser className="size-4" />
              Lihat Profil
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
