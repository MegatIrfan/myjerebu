import Link from "next/link";
import { Activity, ShieldAlert, PhoneCall } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SupportCard() {
  return (
    <Card size="sm" className="overflow-hidden shadow-none bg-muted/40 border-border group-data-[collapsible=icon]:hidden">
      <CardHeader className="min-w-0 px-3.5 py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <CardTitle className="text-xs font-semibold">Status Sistem Aktif</CardTitle>
        </div>
        <CardDescription className="text-[11px] leading-relaxed text-muted-foreground">
          16 stesen pemantauan jerebu beroperasi. Dikuasakan oleh WAQI & data cerapan satelit.
        </CardDescription>
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <ShieldAlert className="size-3 text-amber-500" /> Talian JAS:
          </span>
          <a href="tel:0388891972" className="font-bold text-primary hover:underline">
            03-8889 1972
          </a>
        </div>
      </CardHeader>
    </Card>
  );
}
