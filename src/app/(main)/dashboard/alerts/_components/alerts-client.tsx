"use client";

import { useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  Mail,
  MessageSquare,
  PhoneCall,
  Send,
  ShieldAlert,
  Sliders,
  Smartphone,
  Volume2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MalaysiaFlag } from "@/components/malaysia-flag";
import type { StateAqiResult } from "../../air-quality/_components/waqi-service";
import type { MalaysiaState } from "../../air-quality/_components/malaysia-states";
import { getAqiInfo } from "../../air-quality/_components/aqi-utils";
import { toast } from "sonner";

interface AlertsClientProps {
  initialResults: StateAqiResult[];
  states: MalaysiaState[];
}

export function AlertsClient({ initialResults, states }: AlertsClientProps) {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [telegramAlerts, setTelegramAlerts] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(100);
  const [userPhone, setUserPhone] = useState("+60 12-345 6789");
  const [userEmail, setUserEmail] = useState("megat.irfan@myjerebu.gov.my");

  // Find all states exceeding the threshold
  const activeAlertStates = states
    .map((s) => {
      const res = initialResults.find((r) => r.stateId === s.id);
      const aqi = res?.data?.aqi ?? 0;
      return {
        state: s,
        aqi,
        info: getAqiInfo(aqi),
        isTriggered: aqi >= alertThreshold,
      };
    })
    .filter((s) => s.isTriggered)
    .sort((a, b) => b.aqi - a.aqi);

  const handleSaveSettings = () => {
    toast.success("Alert preferences and notification rules saved successfully!");
  };

  const handleSendTestAlert = () => {
    toast.info("Test Alert: [MyJerebu Alert] Air quality in Kuching, Sarawak has reached Very Unhealthy levels (AQI 273). Please take precautionary measures.");
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl tracking-tight sm:text-3xl">Haze Alerts &amp; Notification Centre</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure automated dispatch rules for air quality threshold breaches and emergency bulletins.
          </p>
        </div>

        <Button onClick={handleSendTestAlert} variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto">
          <Send className="size-3.5" />
          <span>Send Test Alert</span>
        </Button>
      </div>

      {/* Active High AQI Warnings Feed */}
      <Card className="ring-1 ring-border border-amber-500/20 bg-amber-500/5">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
              </span>
              <CardTitle className="text-sm font-bold text-foreground">
                Active Threshold Breaches ({activeAlertStates.length} States Exceeding {alertThreshold} AQI)
              </CardTitle>
            </div>
            <Badge variant="destructive" className="font-bold text-xs font-mono">
              LIVE BROADCAST
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Automatic triggers dispatched to civil protection agencies and school authorities in affected districts.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-2">
          {activeAlertStates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {activeAlertStates.map(({ state, aqi, info }) => (
                <div
                  key={state.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-2.5">
                    <MalaysiaFlag code={state.flagCode} size="sm" />
                    <div>
                      <span className="font-bold text-xs text-foreground block">{state.name}</span>
                      <span className={`text-[11px] font-semibold ${info.textClass}`}>{info.label}</span>
                    </div>
                  </div>
                  <Badge className={`text-xs font-extrabold font-mono ${info.badgeBgClass} ${info.badgeTextClass}`}>
                    {aqi} AQI
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="size-4" />
              <span>All 16 Malaysian states are currently operating below the {alertThreshold} AQI threshold.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Threshold Trigger Config */}
        <Card className="p-5 ring-1 ring-border flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">AQI Trigger Threshold</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Set the air pollution level that initiates automatic alert dispatch:
              </CardDescription>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Trigger Value:</span>
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  ≥ {alertThreshold} AQI ({getAqiInfo(alertThreshold).label})
                </Badge>
              </div>
              <input
                type="range"
                min={50}
                max={250}
                step={10}
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>50 (Moderate)</span>
                <span>100 (Unhealthy)</span>
                <span>150 (Very Unhealthy)</span>
                <span>200+ (Emergency)</span>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="space-y-1.5">
                <Label htmlFor="alert-email" className="text-xs font-semibold">Officer Email Address</Label>
                <Input
                  id="alert-email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="alert-phone" className="text-xs font-semibold">Emergency SMS Contact</Label>
                <Input
                  id="alert-phone"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="w-full font-bold text-xs h-9 mt-2">
            Save Notification Settings
          </Button>
        </Card>

        {/* Right: Notification Channels & Hotlines */}
        <div className="flex flex-col gap-4">
          <Card className="p-5 ring-1 ring-border space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <BellRing className="size-4 text-primary" />
                <CardTitle className="text-sm font-bold">Dispatch Channels</CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Choose notification channels for live broadcast delivery:
              </CardDescription>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-primary" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Email Broadcasts</span>
                    <span className="text-[11px] text-muted-foreground">Daily bulletins and threshold alerts</span>
                  </div>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <Smartphone className="size-4 text-blue-500" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Emergency SMS</span>
                    <span className="text-[11px] text-muted-foreground">Direct SMS to registered officers (≥150 AQI)</span>
                  </div>
                </div>
                <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-4 text-emerald-500" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">Telegram Bot Channel</span>
                    <span className="text-[11px] text-muted-foreground">Instant notifications via @MyJerebuBot</span>
                  </div>
                </div>
                <Switch checked={telegramAlerts} onCheckedChange={setTelegramAlerts} />
              </div>
            </div>
          </Card>

          {/* Emergency Hotlines Card */}
          <Card className="p-4 ring-1 ring-border bg-muted/20">
            <div className="flex items-center gap-2 font-bold text-xs text-foreground mb-2">
              <PhoneCall className="size-3.5 text-primary" />
              <span>National Emergency Response Hotlines:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-card border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">DOE Complaint Line:</span>
                <span className="font-bold font-mono text-primary">1-800-88-2727</span>
              </div>
              <div className="p-2 rounded-lg bg-card border border-border">
                <span className="text-[10px] text-muted-foreground block font-medium">BOMBA Fire Rescue:</span>
                <span className="font-bold font-mono text-red-500">999 / 112</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
