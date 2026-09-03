"use client";

import { useSyncExternalStore, useCallback, useEffect } from "react";
import { rootUser } from "@/data/users";

const PROFILE_STORAGE_KEY = "myjerebu_user_profile_v1";

export interface UserProfileState {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  phone?: string;
  department?: string;
}

const DEFAULT_PROFILE: UserProfileState = {
  ...rootUser,
  phone: "+60 3-8889 1972",
  department: "Pusat Data Kualiti Udara",
};

// Global in-memory singleton for synchronizing state across all components
let currentProfile: UserProfileState = DEFAULT_PROFILE;
let isInitialized = false;

function initProfile() {
  if (typeof window === "undefined" || isInitialized) return;
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      currentProfile = { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch {
    // fallback
  }
  isInitialized = true;
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): UserProfileState {
  initProfile();
  return currentProfile;
}

function getServerSnapshot(): UserProfileState {
  return DEFAULT_PROFILE;
}

function notifySubscribers() {
  // Use queueMicrotask to ensure notification never executes in the middle of a render cycle
  queueMicrotask(() => {
    for (const listener of listeners) {
      listener();
    }
  });
}

export function useUserProfile() {
  const profile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Sync across tabs via window storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PROFILE_STORAGE_KEY && e.newValue) {
        try {
          currentProfile = { ...DEFAULT_PROFILE, ...JSON.parse(e.newValue) };
          notifySubscribers();
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateAvatar = useCallback((newAvatarUrlOrBase64: string) => {
    currentProfile = { ...currentProfile, avatar: newAvatarUrlOrBase64 };
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(currentProfile));
    } catch {
      // ignore
    }
    notifySubscribers();
  }, []);

  const updateProfile = useCallback((partial: Partial<UserProfileState>) => {
    currentProfile = { ...currentProfile, ...partial };
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(currentProfile));
    } catch {
      // ignore
    }
    notifySubscribers();
  }, []);

  const resetProfile = useCallback(() => {
    currentProfile = DEFAULT_PROFILE;
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {
      // ignore
    }
    notifySubscribers();
  }, []);

  return {
    profile,
    isLoaded: isInitialized,
    updateAvatar,
    updateProfile,
    resetProfile,
  };
}
