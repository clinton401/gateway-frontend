"use client";

import { Shield, ShieldOff, Key, ShieldCheck, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AuthConfigFieldset() {
  const [authMode, setAuthMode] = useState("none");
  const [showSecret, setShowSecret] = useState(false);
  const [claims, setClaims] = useState<{ key: string; value: string }[]>([]);

  const addClaim = () => setClaims([...claims, { key: "", value: "" }]);
  const removeClaim = (index: number) => setClaims(claims.filter((_, i) => i !== index));

  return (
    <div className="space-y-6 pt-6">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-zinc-400" />
        <h3 className="text-sm font-medium text-white">Authentication</h3>
      </div>

      <RadioGroup 
        value={authMode} 
        onValueChange={setAuthMode}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Label
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-colors",
            authMode === "none" 
              ? "border-blue-600 bg-blue-600/5 text-white" 
              : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
          )}
        >
          <RadioGroupItem value="none" className="sr-only" />
          <ShieldOff className="w-5 h-5" />
          <span className="text-sm font-medium">No Auth</span>
          <span className="text-[10px] text-center">All requests pass through</span>
        </Label>

        <Label
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-colors",
            authMode === "apiKey" 
              ? "border-blue-600 bg-blue-600/5 text-white" 
              : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
          )}
        >
          <RadioGroupItem value="apiKey" className="sr-only" />
          <Key className="w-5 h-5" />
          <span className="text-sm font-medium">API Key</span>
          <span className="text-[10px] text-center">Validate X-API-Key</span>
        </Label>

        <Label
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-colors",
            authMode === "jwt" 
              ? "border-blue-600 bg-blue-600/5 text-white" 
              : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700"
          )}
        >
          <RadioGroupItem value="jwt" className="sr-only" />
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm font-medium">JWT</span>
          <span className="text-[10px] text-center">Validate Bearer token</span>
        </Label>
      </RadioGroup>

      {authMode === "apiKey" && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
          <Label className="text-zinc-400">Key Header</Label>
          <Input 
            placeholder="x-api-key" 
            defaultValue="x-api-key"
            className="bg-zinc-800 border-zinc-700 text-white" 
          />
        </div>
      )}

      {authMode === "jwt" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-2">
            <Label className="text-zinc-400">JWT Secret</Label>
            <div className="relative">
              <Input 
                type={showSecret ? "text" : "password"}
                placeholder="secret-key" 
                className="bg-zinc-800 border-zinc-700 text-white pr-10" 
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-zinc-400">Required Claims</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={addClaim}
                className="h-7 text-xs text-blue-500 hover:text-blue-400"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add claim
              </Button>
            </div>
            
            {claims.map((claim, index) => (
              <div key={index} className="flex gap-2">
                <Input 
                  placeholder="role" 
                  className="bg-zinc-800 border-zinc-700 text-white flex-1" 
                />
                <Input 
                  placeholder="admin" 
                  className="bg-zinc-800 border-zinc-700 text-white flex-1" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeClaim(index)}
                  className="text-zinc-500 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {claims.length === 0 && (
              <p className="text-[10px] text-zinc-600 italic">No claims required</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
