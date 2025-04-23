
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Download, X, Maximize2, Minimize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export interface FlowOutput {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  modelId?: string;
  timestamp: string;
  input: any;
  output: any;
  executionTime?: number;
  config?: {
    systemPrompt?: string;
    [key: string]: any;
  };
}

interface FlowOutputPanelProps {
  outputs: FlowOutput[];
  isVisible: boolean;
  onClose: () => void;
  title?: string;
}

function extractJustOutputText(data: any): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'object' && typeof data.output === 'string') return data.output;
  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  if (typeof data.content === 'string') return data.content;
  if (typeof data.text === 'string') return data.text;
  return '';
}

function extractInputSummaries(input: any): string {
  if (Array.isArray(input)) {
    return input.map(item => extractJustOutputText(item)).filter(Boolean).join('\n---\n');
  } else {
    return extractJustOutputText(input);
  }
}

function extractCleanText(data: any): string {
  const text = extractJustOutputText(data) || (typeof data === 'object' ? JSON.stringify(data) : String(data));
  return text.trim();
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
        p: ({ children }) => <p className="mb-4">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ children }) => (
          <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="bg-gray-100 p-3 rounded-md mb-4 overflow-x-auto">{children}</pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4">{children}</blockquote>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function FlowOutputPanel({ outputs, isVisible, onClose, title = "Flow Execution Results" }: FlowOutputPanelProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ease-in-out z-30 ${
        isFullscreen ? 'top-0' : ''
      }`}
    >
      <ResizablePanelGroup 
        direction="vertical"
        className="h-full border-t border-gray-800"
      >
        {!isFullscreen && (
          <ResizablePanel
            defaultSize={75}
            id="top-content"
            minSize={20}
          />
        )}
        
        <ResizableHandle 
          withHandle 
          id="resize-handle"
          className="h-4 bg-gray-800 hover:bg-gray-700" 
        />
        
        <ResizablePanel 
          defaultSize={isFullscreen ? 100 : 25}
          id="output-panel"
          minSize={15}
          maxSize={isFullscreen ? 100 : 80}
          className="min-h-[200px]"
        >
          <Card className="bg-gray-900 text-white h-full overflow-hidden rounded-b-none">
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
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
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
            
            <ScrollArea className={isFullscreen ? 'h-[calc(100vh-64px)]' : 'h-[300px]'}>
              {outputs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No output data available. Run the flow to see results.
                </div>
              ) : (
                <div className="space-y-3 p-4">
                  {outputs.map((output, index) => {
                    const nodeKey = `${output.nodeId}-${index}`;
                    const isExpanded = expandedNodes[nodeKey] || false;
                    const systemPrompt = output.config?.systemPrompt || '';

                    return (
                      <Collapsible
                        key={nodeKey}
                        open={isExpanded} 
                        onOpenChange={() => toggleNodeExpansion(nodeKey)}
                        className="rounded-md overflow-hidden"
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 cursor-pointer rounded-t-md">
                            <div className="flex items-center">
                              {isExpanded ? 
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
                          <div className="bg-white text-gray-900 p-4 rounded-b-md space-y-4">
                            {output.input && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-600 mb-2">Input:</h4>
                                <div className="p-3 bg-gray-50 rounded-md text-sm overflow-x-auto">
                                  <MarkdownContent content={extractInputSummaries(output.input)} />
                                </div>
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm font-medium text-gray-600 mb-2">Output:</h4>
                              <div className="p-3 bg-gray-50 rounded-md text-sm overflow-x-auto">
                                <MarkdownContent content={extractCleanText(output.output)} />
                              </div>
                            </div>
                            {systemPrompt && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-600 mb-2">System Prompt:</h4>
                                <div className="p-3 bg-gray-50 rounded-md text-sm overflow-x-auto text-blue-600">
                                  <MarkdownContent content={systemPrompt} />
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
