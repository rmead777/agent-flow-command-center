
import { Handle, Position } from '@xyflow/react';
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { MessageSquare } from "lucide-react";

interface InputPromptNodeProps {
  data: {
    prompt?: string;
    onPromptChange?: (prompt: string) => void;
  };
  selected: boolean;
}

export function InputPromptNode({ data, selected }: InputPromptNodeProps) {
  const [prompt, setPrompt] = useState(data.prompt ?? "");

  // Sync input with parent workflow state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    data.onPromptChange?.(e.target.value);
  };

  return (
    <div
      className={`rounded-md p-4 shadow-md bg-sky-900 text-sky-100 border-2 ${selected ? "ring-2 ring-white/60" : "border-sky-800"}`}
      style={{ width: 210, minHeight: 90 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-300" isConnectable={true} />
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare size={18} className="text-sky-300" />
        <span className="font-semibold text-sm">User Prompt</span>
      </div>
      <Input
        value={prompt}
        onChange={handleChange}
        placeholder="Enter initial workflow prompt"
        className="text-gray-900 bg-slate-50 border"
        spellCheck
      />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-300" isConnectable={true} />
    </div>
  );
}
