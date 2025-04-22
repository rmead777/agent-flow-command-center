
import { Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
  {
    id: 'node-1',
    type: 'agent',
    position: { x: 250, y: 100 },
    data: {
      label: 'User Input',
      type: 'input',
      status: 'idle',
      metrics: {
        tasksProcessed: 124,
        latency: 12,
        errorRate: 0.5,
      },
      // Add model ID and config
      modelId: 'gpt-4o',
      config: {
        systemPrompt: 'You are a helpful AI assistant.',
        temperature: 0.7,
        maxTokens: 512,
        streamResponse: true,
        retryOnError: true
      }
    },
  },
  {
    id: 'node-2',
    type: 'agent',
    position: { x: 250, y: 250 },
    data: {
      label: 'Process Data',
      type: 'action',
      status: 'active',
      metrics: {
        tasksProcessed: 87,
        latency: 56,
        errorRate: 2.1,
      },
      // Add model ID and config
      modelId: 'claude-3.7-sonnet',
      config: {
        systemPrompt: 'You analyze and process data efficiently.',
        temperature: 0.5,
        maxTokens: 1024,
        streamResponse: false,
        retryOnError: true
      }
    },
  },
  {
    id: 'node-3',
    type: 'agent',
    position: { x: 250, y: 400 },
    data: {
      label: 'Generate Response',
      type: 'response',
      status: 'error',
      metrics: {
        tasksProcessed: 56,
        latency: 230,
        errorRate: 5.3,
      },
      // Add model ID and config
      modelId: 'gemini-2.5-pro',
      config: {
        systemPrompt: 'You generate thoughtful and accurate responses.',
        temperature: 0.8,
        maxTokens: 2048,
        streamResponse: true,
        retryOnError: false
      }
    },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'edge-1-2',
    source: 'node-1',
    target: 'node-2',
    animated: true,
  },
  {
    id: 'edge-2-3',
    source: 'node-2',
    target: 'node-3',
    animated: true,
  },
];
