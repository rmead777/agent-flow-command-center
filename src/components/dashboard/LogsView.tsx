import { useState, useEffect } from 'react';
import { Search, Filter, Download, AlertCircle, FileJson } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logs, flowOutputs } from '@/data/logData';
import { LogFilters } from "./LogFilters";
import { LogTable } from "./LogTable";
import { FlowOutputsView } from "./FlowOutputsView";
import { FlowOutputPanel } from '@/components/flow/FlowOutputPanel';

export function LogsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('logs');
  const [showOutputDetails, setShowOutputDetails] = useState(false);

  const filteredLogs = logs
    .filter(log => 
      (agentFilter === 'all' || log.agentName === agentFilter) &&
      (eventFilter === 'all' || log.eventType === eventFilter) &&
      (searchTerm === '' || 
       log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
       log.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       log.eventType.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const agents = Array.from(new Set(logs.map(log => log.agentName)));
  const eventTypes = Array.from(new Set(logs.map(log => log.eventType)));

  const downloadCSV = () => {
    const headers = ['Timestamp', 'Agent Name', 'Event Type', 'Details'].join(',');
    const csvContent = filteredLogs.map(log => 
      [
        log.timestamp,
        `"${log.agentName}"`,
        `"${log.eventType}"`,
        `"${log.details.replace(/"/g, '""')}"`
      ].join(',')
    ).join('\n');
    
    const csv = `${headers}\n${csvContent}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agent_logs_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-gray-900 text-white border-gray-800 p-4">
      <Tabs defaultValue="logs" value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-4 flex justify-between items-center">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="logs">System Logs</TabsTrigger>
            <TabsTrigger value="outputs">Flow Outputs</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2 border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={downloadCSV}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export {activeTab === 'logs' ? 'Logs' : 'Outputs'}</span>
            </Button>
          </div>
        </div>

        <TabsContent value="logs" className="p-0 border-none">
          <LogFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            agentFilter={agentFilter}
            setAgentFilter={setAgentFilter}
            eventFilter={eventFilter}
            setEventFilter={setEventFilter}
            agents={agents}
            eventTypes={eventTypes}
          />
          <LogTable logs={filteredLogs} />
        </TabsContent>

        <TabsContent value="outputs" className="p-0 border-none">
          {showOutputDetails ? (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowOutputDetails(false)}
                className="mb-2"
              >
                Back to Output List
              </Button>
              <FlowOutputPanel 
                outputs={flowOutputs} 
                isVisible={true} 
                onClose={() => setShowOutputDetails(false)} 
                title="Historical Flow Outputs" 
              />
            </div>
          ) : (
            <FlowOutputsView
              flowOutputs={flowOutputs}
              showOutputDetails={showOutputDetails}
              setShowOutputDetails={setShowOutputDetails}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
