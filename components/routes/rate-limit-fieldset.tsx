"use client";

import { Gauge } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function RateLimitFieldset() {
  const [enabled, setEnabled] = useState(false);
  const [keyBy, setKeyBy] = useState("ip");

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-medium text-white">Rate Limiting</h3>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className={cn("space-y-4", !enabled && "opacity-40 pointer-events-none")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Max Requests</Label>
            <Input 
              type="number" 
              placeholder="100" 
              className="bg-zinc-800 border-zinc-700 text-white" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Window (ms)</Label>
            <Input 
              type="number" 
              placeholder="60000" 
              className="bg-zinc-800 border-zinc-700 text-white" 
            />
            <p className="text-[10px] text-zinc-500">1 minute = 60000ms</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400">Identify Client By</Label>
          <Select value={keyBy} onValueChange={setKeyBy}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              <SelectItem value="ip">IP Address</SelectItem>
              <SelectItem value="apiKey">API Key</SelectItem>
              <SelectItem value="header">Custom Header</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {keyBy === "header" && (
          <div className="space-y-2">
            <Label className="text-zinc-400">Header Name</Label>
            <Input 
              placeholder="X-Client-Id" 
              className="bg-zinc-800 border-zinc-700 text-white" 
            />
          </div>
        )}
      </div>
    </div>
  );
}
