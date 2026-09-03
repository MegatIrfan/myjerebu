"use client";

import { BadgeCheck, Camera, Ellipsis, Eye, Mail, Pencil, UserRoundX } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvatarUploadDialog } from "@/components/avatar-upload-dialog";
import { useUserProfile } from "@/hooks/use-user-profile";

import type { ProfileRecord } from "./profile-data";

interface ProfileHeaderProps {
  profile: ProfileRecord;
}

export function ProfileHeader({ profile: initialProfile }: ProfileHeaderProps) {
  const { profile: userProfile, updateAvatar } = useUserProfile();

  const currentAvatar = userProfile.avatar || initialProfile.avatar;
  const currentName = userProfile.name || initialProfile.name;

  return (
    <div className="flex flex-col gap-5 px-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative group cursor-pointer">
          <AvatarUploadDialog
            currentAvatar={currentAvatar}
            userName={currentName}
            onAvatarChange={updateAvatar}
          >
            <div className="grid size-18 shrink-0 place-items-center sm:size-23">
              <span className="sr-only">Profile 100% complete</span>
              <svg aria-hidden="true" className="col-start-1 row-start-1 size-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="fill-none stroke-green-500 dark:stroke-green-600"
                  cx="50"
                  cy="50"
                  pathLength="100"
                  r="46"
                  strokeDasharray="100 100"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
              </svg>
              <Avatar className="col-start-1 row-start-1 size-16 after:border-0 sm:size-20">
                <AvatarImage alt={currentName} src={currentAvatar} className="object-cover" />
                <AvatarFallback>{initialProfile.initials}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="size-5" />
              </div>
            </div>
          </AvatarUploadDialog>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-col gap-0.5">
            <h1 className="truncate font-heading font-semibold text-xl leading-6 tracking-tight sm:text-2xl sm:leading-7">
              {currentName}
            </h1>
            <p className="truncate text-muted-foreground text-sm leading-5">
              {initialProfile.workEmail} · {initialProfile.jobTitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              className="rounded-sm border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              variant="secondary"
            >
              100% Selesai
            </Badge>
            <Badge className="rounded-sm bg-green-600 text-white" variant="default">
              <BadgeCheck data-icon="inline-start" />
              Disahkan
            </Badge>
            <Badge className="rounded-sm" variant="outline">
              {initialProfile.employmentType}
            </Badge>
            <Badge className="rounded-sm" variant="outline">
              {initialProfile.workplace}
            </Badge>
            <Badge className="rounded-sm" variant="outline">
              {initialProfile.timeZone}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AvatarUploadDialog
          currentAvatar={currentAvatar}
          userName={currentName}
          onAvatarChange={updateAvatar}
        >
          <Button size="sm" variant="outline" className="gap-1.5">
            <Camera className="size-4" />
            <span>Tukar Gambar</span>
          </Button>
        </AvatarUploadDialog>
        <Button size="sm" asChild variant="outline">
          <a href={`mailto:${initialProfile.workEmail}`}>
            <Mail data-icon="inline-start" />
            Emel
          </a>
        </Button>
        <Button size="sm">
          <Pencil data-icon="inline-start" />
          Edit profile
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-label="More profile actions" size="icon-sm" variant="outline">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Eye />
                View as employee
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">
                <UserRoundX />
                Deactivate profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
