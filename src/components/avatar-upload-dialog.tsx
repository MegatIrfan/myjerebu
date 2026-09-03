"use client";

import { useState, useRef } from "react";
import { Camera, Image as ImageIcon, Link as LinkIcon, RefreshCw, Trash2, Upload, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

interface AvatarUploadDialogProps {
  currentAvatar: string;
  userName: string;
  onAvatarChange: (newAvatar: string) => void;
  children?: React.ReactNode;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
];

export function AvatarUploadDialog({
  currentAvatar,
  userName,
  onAvatarChange,
  children,
}: AvatarUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(currentAvatar);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Sila pilih fail imej yang sah (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Saiz fail melebihi had 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedPreview(reader.result);
        toast.success("Imej berjaya dimuat naik!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onAvatarChange(selectedPreview);
    setOpen(false);
    toast.success("Gambar profil berjaya dikemas kini!");
  };

  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    setSelectedPreview(urlInput.trim());
    setUrlInput("");
    toast.success("Pautan gambar berjaya digunakan!");
  };

  const handleRemove = () => {
    setSelectedPreview("");
    toast.info("Gambar profil dibuang. Inisial nama akan dipaparkan.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline" className="gap-1.5">
            <Camera className="size-4" />
            <span>Tukar Gambar</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tukar Gambar Profil</DialogTitle>
          <DialogDescription>
            Muat naik foto baharu dari peranti anda atau pilih gambar pilihan rasmi.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-3">
          {/* Live Avatar Preview */}
          <div className="relative group">
            <Avatar className="size-24 rounded-2xl ring-4 ring-primary/20 shadow-md">
              <AvatarImage src={selectedPreview || undefined} alt={userName} className="object-cover" />
              <AvatarFallback className="rounded-2xl text-xl font-bold bg-primary text-primary-foreground">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Upload className="size-6" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5"
            >
              <Upload className="size-3.5" />
              <span>Muat Naik Foto</span>
            </Button>
            {selectedPreview && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemove}
                className="gap-1.5 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3.5" />
                <span>Padam</span>
              </Button>
            )}
          </div>

          {/* Preset Gallery */}
          <div className="w-full space-y-2 pt-2 border-t border-border">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Atau Pilih Foto Pilihan:
            </Label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPreview(url)}
                  className={`relative rounded-xl overflow-hidden aspect-square ring-2 transition-all hover:scale-105 ${
                    selectedPreview === url ? "ring-primary shadow-xs" : "ring-transparent hover:ring-border"
                  }`}
                >
                  <img src={url} alt={`Preset ${idx + 1}`} className="size-full object-cover" />
                  {selectedPreview === url && (
                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center text-white">
                      <Check className="size-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Direct URL input */}
          <div className="w-full space-y-1.5">
            <Label className="text-xs text-muted-foreground">Pautan Imej (URL Langsung):</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="https://example.com/photo.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="h-8 text-xs"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleUrlApply} className="h-8 px-3 text-xs">
                Guna
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button type="button" onClick={handleSave} className="gap-1.5">
            <Check className="size-4" />
            <span>Simpan Perubahan</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
