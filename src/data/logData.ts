
// Sample log data for the logs view
import { FlowOutput } from "@/components/flow/FlowOutputPanel";

export const logs = [
  {
    id: '1',
    timestamp: '2023-04-22 08:02:13',
    agentName: 'User Input',
    eventType: 'info',
    details: 'Received new user query: "How can I optimize my ML pipeline for better performance?"',
  },
  {
    id: '2',
    timestamp: '2023-04-22 08:02:14',
    agentName: 'Query Parser',
    eventType: 'info',
    details: 'Parsed user query, identified main topic: ML pipeline optimization',
  },
  {
    id: '3',
    timestamp: '2023-04-22 08:02:17',
    agentName: 'Context Retriever',
    eventType: 'info',
    details: 'Retrieved 15 relevant documents from knowledge base',
  },
  {
    id: '4',
    timestamp: '2023-04-22 08:02:22',
    agentName: 'Reasoning Agent',
    eventType: 'error',
    details: 'Failed to process query with error: API rate limit exceeded',
  },
  {
    id: '5',
    timestamp: '2023-04-22 08:02:23',
    agentName: 'Reasoning Agent',
    eventType: 'warning',
    details: 'Retrying query processing with reduced context window',
  },
  {
    id: '6',
    timestamp: '2023-04-22 08:02:28',
    agentName: 'Reasoning Agent',
    eventType: 'info',
    details: 'Successfully processed query on second attempt',
  },
  {
    id: '7',
    timestamp: '2023-04-22 08:02:36',
    agentName: 'Content Generator',
    eventType: 'info',
    details: 'Generated response with 3 optimization strategies',
  },
  {
    id: '8',
    timestamp: '2023-04-22 08:02:40',
    agentName: 'Response Formatter',
    eventType: 'info',
    details: 'Formatted response with markdown and code snippets',
  },
  {
    id: '9',
    timestamp: '2023-04-22 08:05:21',
    agentName: 'User Input',
    eventType: 'info',
    details: 'Received follow-up query: "Can you provide code examples for the batch processing optimization?"',
  },
  {
    id: '10',
    timestamp: '2023-04-22 08:05:24',
    agentName: 'Query Parser',
    eventType: 'info',
    details: 'Parsed follow-up query, maintaining conversation context',
  },
  {
    id: '11',
    timestamp: '2023-04-22 08:05:30',
    agentName: 'Context Retriever',
    eventType: 'warning',
    details: 'Limited context retrieval due to high token usage',
  },
  {
    id: '12',
    timestamp: '2023-04-22 08:05:37',
    agentName: 'Reasoning Agent',
    eventType: 'error',
    details: 'Timeout error while processing query',
  },
  {
    id: '13',
    timestamp: '2023-04-22 08:05:38',
    agentName: 'System',
    eventType: 'error',
    details: 'Agent flow execution incomplete, fallback to direct model query',
  },
  {
    id: '14',
    timestamp: '2023-04-22 08:05:45',
    agentName: 'Content Generator',
    eventType: 'info',
    details: 'Used simplified model to generate response with code examples',
  },
  {
    id: '15',
    timestamp: '2023-04-22 08:05:52',
    agentName: 'Response Formatter',
    eventType: 'info',
    details: 'Added disclaimer about potential limitations in the generated code',
  },
  {
    id: '16',
    timestamp: '2023-04-22 08:10:03',
    agentName: 'System',
    eventType: 'info',
    details: 'Flow execution completed successfully',
  },
  {
    id: '17',
    timestamp: '2023-04-22 08:15:42',
    agentName: 'Reasoning Agent',
    eventType: 'error',
    details: 'LLM hallucination detected: provided incorrect information about PyTorch API',
  },
  {
    id: '18',
    timestamp: '2023-04-22 08:15:47',
    agentName: 'Content Generator',
    eventType: 'warning',
    details: 'Content filtered due to potential inaccuracy',
  },
  {
    id: '19',
    timestamp: '2023-04-22 08:20:13',
    agentName: 'System',
    eventType: 'info',
    details: 'Agent flow reconfigured with updated prompt',
  },
  {
    id: '20',
    timestamp: '2023-04-22 08:25:01',
    agentName: 'User Input',
    eventType: 'info',
    details: 'New session started with query: "What are the benefits of using multiple specialized agents instead of a single large model?"',
  },
];

// Store flow execution outputs for historical reference
export let flowOutputs: FlowOutput[] = [];

// Add new flow outputs to the log history
export function addFlowOutputsToHistory(outputs: FlowOutput[]) {
  flowOutputs = [...outputs, ...flowOutputs].slice(0, 100); // Keep last 100 outputs
  
  // Also add summary entries to the general logs
  const timestamp = new Date().toISOString();
  
  logs.unshift({
    id: `flow-run-${Date.now()}`,
    timestamp: timestamp.replace('T', ' ').substring(0, 19),
    agentName: 'Flow Engine',
    eventType: 'info',
    details: `Completed flow execution with ${outputs.length} node outputs`,
  });
  
  // Add individual node outputs as log entries for errors
  outputs.forEach(output => {
    if (output.nodeType === 'error' || output.output.toString().toLowerCase().includes('error')) {
      logs.unshift({
        id: `node-${output.nodeId}-${Date.now()}`,
        timestamp: output.timestamp.replace('T', ' ').substring(0, 19),
        agentName: output.nodeName,
        eventType: 'error',
        details: `Error in node execution: ${typeof output.output === 'object' ? JSON.stringify(output.output) : output.output}`,
      });
    }
  });
}
