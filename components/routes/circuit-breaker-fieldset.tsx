"use client";

import { Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CircuitBreakerFieldset() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-medium text-white">Circuit Breaker</h3>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <div className={cn("space-y-4", !enabled && "opacity-40 pointer-events-none")}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-400">Failure Threshold</Label>
            <Input 
              type="number" 
              placeholder="5" 
              className="bg-zinc-800 border-zinc-700 text-white" 
            />
            <p className="text-[10px] text-zinc-500">Failures before opening</p>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Window Size</Label>
            <Input 
              type="number" 
              placeholder="10" 
              className="bg-zinc-800 border-zinc-700 text-white" 
            />
            <p className="text-[10px] text-zinc-500">Recent requests to evaluate</p>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Cooldown (ms)</Label>
            <Input 
              type="number" 
              placeholder="30000" 
              className="bg-zinc-800 border-zinc-700 text-white" 
            />
            <p className="text-[10px] text-zinc-500">Time to stay open</p>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Success Threshold</Label>
            <Input 
              type="number" 
              placeholder="1" 
              className="bg-zinc-800 border-zinc-700 text-white" 
            />
            <p className="text-[10px] text-zinc-500">Successes to close</p>
          </div>
        </div>
      </div>
    </div>
  );
}
