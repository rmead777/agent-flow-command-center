
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Download, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface FlowOutput {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  modelId?: string;
  timestamp: string;
  input: any;
  output: any;
  executionTime?: number;
}

interface FlowOutputPanelProps {
  outputs: FlowOutput[];
  isVisible: boolean;
  onClose: () => void;
  title?: string;
}

export function FlowOutputPanel({ outputs, isVisible, onClose, title = "Flow Execution Results" }: FlowOutputPanelProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  if (!isVisible) return null;

  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const handleExportOutputs = () => {
    const jsonContent = JSON.stringify(outputs, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flow-outputs-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border-t border-gray-800 bg-gray-900 text-white overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant="outline" className="ml-2 bg-gray-800">
            {outputs.length} outputs
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 text-gray-300 border-gray-700"
            onClick={handleExportOutputs}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-gray-300"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[300px] p-4">
        {outputs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No output data available. Run the flow to see results.
          </div>
        ) : (
          <div className="space-y-3">
            {outputs.map((output, index) => (
              <Collapsible 
                key={`${output.nodeId}-${index}`}
                open={expandedNodes[`${output.nodeId}-${index}`]} 
                onOpenChange={() => toggleNodeExpansion(`${output.nodeId}-${index}`)}
                className="border border-gray-800 rounded-md overflow-hidden"
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 cursor-pointer">
                    <div className="flex items-center">
                      {expandedNodes[`${output.nodeId}-${index}`] ? 
                        <ChevronDown className="h-4 w-4 mr-2 text-gray-400" /> : 
                        <ChevronRight className="h-4 w-4 mr-2 text-gray-400" />
                      }
                      <div className="flex flex-col">
                        <span className="font-medium">{output.nodeName}</span>
                        <div className="flex gap-2 text-xs text-gray-400">
                          <span>{output.timestamp}</span>
                          {output.executionTime && (
                            <span>{output.executionTime}ms</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize bg-gray-700">
                        {output.nodeType}
                      </Badge>
                      {output.modelId && (
                        <Badge variant="secondary" className="bg-purple-900/50 text-purple-200">
                          {output.modelId}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-3 bg-gray-900 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Input:</h4>
                      <pre className="p-2 bg-gray-800 rounded-md text-xs overflow-x-auto">
                        {typeof output.input === 'object' 
                          ? JSON.stringify(output.input, null, 2) 
                          : output.input}
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Output:</h4>
                      <pre className="p-2 bg-gray-800 rounded-md text-xs overflow-x-auto">
                        {typeof output.output === 'object' 
                          ? JSON.stringify(output.output, null, 2) 
                          : output.output}
                      </pre>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
