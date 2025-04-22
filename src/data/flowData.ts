
// Sample flow data for the flow visualization
export const initialNodes = [
  {
    id: 'input-1',
    type: 'agent',
    position: { x: 250, y: 0 },
    data: {
      label: 'User Input',
      type: 'input',
      status: 'active' as const,
      metrics: {
        tasksProcessed: 128,
        latency: 15,
        errorRate: 0,
      },
    },
  },
  {
    id: 'action-1',
    type: 'agent',
    position: { x: 100, y: 150 },
    data: {
      label: 'Query Parser',
      type: 'action',
      status: 'active' as const,
      metrics: {
        tasksProcessed: 122,
        latency: 34,
        errorRate: 1.2,
      },
    },
  },
  {
    id: 'action-2',
    type: 'agent',
    position: { x: 400, y: 150 },
    data: {
      label: 'Context Retriever',
      type: 'action',
      status: 'idle' as const,
      metrics: {
        tasksProcessed: 98,
        latency: 145,
        errorRate: 5.4,
      },
    },
  },
  {
    id: 'action-3',
    type: 'agent',
    position: { x: 100, y: 300 },
    data: {
      label: 'Reasoning Agent',
      type: 'action',
      status: 'error' as const,
      metrics: {
        tasksProcessed: 76,
        latency: 220,
        errorRate: 12.8,
      },
    },
  },
  {
    id: 'action-4',
    type: 'agent',
    position: { x: 400, y: 300 },
    data: {
      label: 'Content Generator',
      type: 'action',
      status: 'active' as const,
      metrics: {
        tasksProcessed: 84,
        latency: 180,
        errorRate: 3.2,
      },
    },
  },
  {
    id: 'output-1',
    type: 'agent',
    position: { x: 250, y: 450 },
    data: {
      label: 'Response Formatter',
      type: 'response',
      status: 'active' as const,
      metrics: {
        tasksProcessed: 105,
        latency: 28,
        errorRate: 0.5,
      },
    },
  },
];

export const initialEdges = [
  { id: 'e1-2', source: 'input-1', target: 'action-1', animated: true },
  { id: 'e1-3', source: 'input-1', target: 'action-2', animated: true },
  { id: 'e2-4', source: 'action-1', target: 'action-3' },
  { id: 'e3-5', source: 'action-2', target: 'action-4' },
  { id: 'e4-6', source: 'action-3', target: 'output-1' },
  { id: 'e5-6', source: 'action-4', target: 'output-1' },
];
