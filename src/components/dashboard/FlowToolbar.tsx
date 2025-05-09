
import { Plus, Save, Play, Code, Settings, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import React from "react";
import { Button } from "@/components/ui/button";

interface FlowToolbarProps {
  onAddNode: () => void;
  onAutoLayout: () => void;
  onExecuteFlow: () => void;
  onSaveFlow: () => void;
  onShowCode: () => void;
  onShowSettings: () => void;
  onToggleOutputPanel: () => void;
  isValidated: boolean;
  isExecuting: boolean;
  flowOutputsLength: number;
  showOutputPanel: boolean;
}

export const FlowToolbar: React.FC<FlowToolbarProps> = ({
  onAddNode,
  onAutoLayout,
  onExecuteFlow,
  onSaveFlow,
  onShowCode,
  onShowSettings,
  onToggleOutputPanel,
  isValidated,
  isExecuting,
  flowOutputsLength,
  showOutputPanel
}) => (
  <div className="absolute top-2 left-2 z-10 flex gap-2 flex-wrap bg-gray-900/60 backdrop-blur-sm p-2 rounded-lg border border-gray-800">
    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 text-xs rounded flex items-center gap-1" onClick={onAddNode} title="Add Node">
      <Plus size={16} />
      Add Node
    </Button>
    <Button onClick={onAutoLayout} title="Auto Layout" className="text-white px-2 py-1 text-xs rounded flex items-center gap-1 bg-[#bb3568] hover:bg-[#a62e5a]">
      Auto Layout
    </Button>
    <Button 
      className={`${isValidated ? "bg-green-600 hover:bg-green-700" : "bg-gray-600"} 
        text-white px-2 py-1 text-xs rounded flex items-center gap-1 ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`} 
      onClick={onExecuteFlow} 
      disabled={isExecuting} 
      title="Run Flow"
    >
      <Play size={16} />
      {isExecuting ? "Executing..." : "Execute Flow"}
    </Button>
    <Button onClick={onSaveFlow} title="Save Flow" className="text-white px-2 py-1 text-xs rounded flex items-center gap-1 bg-sky-950 hover:bg-sky-800">
      <Save size={16} />
      Save
    </Button>
    <Button onClick={onShowCode} title="Export" className="text-white px-2 py-1 text-xs rounded flex items-center gap-1 bg-zinc-950 hover:bg-zinc-800">
      <Code size={16} />
      Code
    </Button>
    <Button onClick={onShowSettings} title="Settings" className="text-xs rounded flex items-center gap-1 bg-zinc-50 text-zinc-950 hover:bg-zinc-200">
      <Settings size={16} />
      Settings
    </Button>
    {flowOutputsLength > 0 && (
      <Button 
        onClick={onToggleOutputPanel} 
        title={showOutputPanel ? "Hide Outputs" : "Show Outputs"} 
        className="text-white py-1 text-xs rounded flex items-center gap-1 bg-red-800 hover:bg-red-700"
      >
        {showOutputPanel ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        Outputs
      </Button>
    )}
  </div>
);
