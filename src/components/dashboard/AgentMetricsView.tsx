
import { useState } from 'react';
import { agents, getAgentMetrics, getRecentTasks } from '@/data/agentData';
import { TaskCompletionChart } from './TaskCompletionChart';
import { ErrorRatesChart } from './ErrorRatesChart';
import { RecentTasksTable } from './RecentTasksTable';

export function AgentMetricsView() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.id || "");
  
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="col-span-full mb-4">
        <div className="flex flex-wrap gap-2">
          {agents.map((agent) => (
            <button
              key={agent.id}
              className={`rounded px-3 py-1 text-sm ${
                selectedAgent === agent.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => setSelectedAgent(agent.id)}
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>
      {selectedAgent && (
        <>
          <TaskCompletionChart metrics={getAgentMetrics(selectedAgent)} />
          <ErrorRatesChart metrics={getAgentMetrics(selectedAgent)} />
          <RecentTasksTable tasks={getRecentTasks(selectedAgent)} />
        </>
      )}
    </div>
  );
}
