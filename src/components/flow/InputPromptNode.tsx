
import { Handle, Position } from '@xyflow/react';
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";

interface InputPromptNodeProps {
  data: {
    prompt?: string;
    onPromptChange?: (prompt: string) => void;
    label: string;
    type: string;
    status?: 'active' | 'idle' | 'error';
    color?: string; // Custom color
    [key: string]: any;
  };
  selected: boolean;
  id: string;
}

export function InputPromptNode({ data, selected, id }: InputPromptNodeProps) {
  const [prompt, setPrompt] = useState(data.prompt ?? "");

  useEffect(() => {
    if (data.prompt !== undefined && data.prompt !== prompt) {
      setPrompt(data.prompt);
    }
  }, [data.prompt]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);
    if (data.onPromptChange) {
      data.onPromptChange(newValue);
    }
    console.log(`Input prompt changed for node ${id}: ${newValue}`);
  };

  const getStatusColor = () => {
    if (data.status === 'active') return 'bg-green-500';
    if (data.status === 'error') return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div
      className={`rounded-md p-4 shadow-md border-2 ${selected ? "ring-2 ring-white/60" : "border-sky-800"}`}
      style={{
        background: data.color ? data.color : "#0c3052", // fallback sky-900
        color: data.color ? "#15142b" : "#e0ecff",
        width: 250,
        minHeight: 120
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-300" isConnectable={true} />
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-sky-300" />
          <span className="font-semibold text-sm">{data.label}</span>
        </div>
        <div className={`h-2 w-2 rounded-full ${getStatusColor()}`} />
      </div>
      <Textarea
        value={prompt}
        onChange={handleChange}
        placeholder="Enter initial workflow prompt"
        className="text-gray-900 bg-slate-50 border min-h-20"
        spellCheck
      />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-300" isConnectable={true} />
    </div>
  );
}
