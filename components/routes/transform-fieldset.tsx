"use client";

import { ArrowLeftRight, Plus, Trash2, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Operation {
  id: string;
  type: "set" | "remove" | "rename";
  key: string;
  value?: string;
  to?: string;
}

function TransformSection({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ops, setOps] = useState<Operation[]>([]);

  const addOp = () => {
    setOps([...ops, { id: Math.random().toString(), type: "set", key: "" }]);
  };

  const removeOp = (id: string) => {
    setOps(ops.filter(op => op.id !== id));
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-zinc-800 rounded-lg overflow-hidden">
      <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-zinc-900 hover:bg-zinc-800/50 transition-colors">
        <span className="text-sm font-medium text-zinc-300">{title}</span>
        <ChevronRight className={cn("w-4 h-4 text-zinc-500 transition-transform", isOpen && "rotate-90")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 bg-zinc-950 space-y-4">
        {ops.map((op) => (
          <div key={op.id} className="flex gap-2 items-start">
            <Select defaultValue={op.type} onValueChange={(v) => {
              setOps(ops.map(o => o.id === op.id ? { ...o, type: v as any } : o));
            }}>
              <SelectTrigger className="w-[120px] bg-zinc-800 border-zinc-700 text-white text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="set">Set</SelectItem>
                <SelectItem value="remove">Remove</SelectItem>
                <SelectItem value="rename">Rename</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              placeholder={op.type === "rename" ? "From field" : "Header/Field"} 
              className="bg-zinc-800 border-zinc-700 text-white h-9 text-xs flex-1"
            />

            {op.type === "set" && (
              <Input 
                placeholder="Value" 
                className="bg-zinc-800 border-zinc-700 text-white h-9 text-xs flex-1"
              />
            )}

            {op.type === "rename" && (
              <Input 
                placeholder="To field" 
                className="bg-zinc-800 border-zinc-700 text-white h-9 text-xs flex-1"
              />
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-zinc-500 hover:text-red-500"
              onClick={() => removeOp(op.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {ops.length === 0 && (
          <p className="text-xs text-zinc-600 italic">No operations configured</p>
        )}
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={addOp}
          className="h-8 text-[10px] text-blue-500 hover:text-blue-400 p-0"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add operation
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function TransformFieldset() {
  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-medium text-white">Request & Response Transforms</h3>
        </div>
        <p className="text-[10px] text-zinc-500">
          Transforms are applied in order. Changes propagate to the gateway within seconds.
        </p>
      </div>

      <div className="space-y-3">
        <TransformSection title="Request Headers" />
        <TransformSection title="Request Body" />
        
        <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/50 space-y-4">
          <span className="text-sm font-medium text-zinc-300">Request Path</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500">Strip Prefix</Label>
              <Input placeholder="/api" className="bg-zinc-800 border-zinc-700 text-white h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500">Add Prefix</Label>
              <Input placeholder="/v1" className="bg-zinc-800 border-zinc-700 text-white h-8 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] text-zinc-500">Regex Replace</Label>
              <div className="flex gap-1">
                <Input placeholder=".*" className="bg-zinc-800 border-zinc-700 text-white h-8 text-xs" />
                <Input placeholder="$1" className="bg-zinc-800 border-zinc-700 text-white h-8 text-xs" />
              </div>
            </div>
          </div>
        </div>

        <TransformSection title="Response Headers" />
        <TransformSection title="Response Body" />
      </div>
    </div>
  );
}
