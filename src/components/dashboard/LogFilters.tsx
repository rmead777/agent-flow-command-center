
import { Search, Filter } from "lucide-react";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LogFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  agentFilter: string;
  setAgentFilter: (term: string) => void;
  eventFilter: string;
  setEventFilter: (term: string) => void;
  agents: string[];
  eventTypes: string[];
}

export function LogFilters({
  searchTerm,
  setSearchTerm,
  agentFilter,
  setAgentFilter,
  eventFilter,
  setEventFilter,
  agents,
  eventTypes,
}: LogFiltersProps) {
  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search logs..."
          className="border-gray-800 bg-gray-800 pl-8 text-white placeholder:text-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-[160px] border-gray-800 bg-gray-800 text-white">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by Agent" />
          </SelectTrigger>
          <SelectContent className="border-gray-800 bg-gray-800 text-white">
            <SelectItem value="all">All Agents</SelectItem>
            {agents.map(agent => (
              <SelectItem key={agent} value={agent}>{agent}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-[160px] border-gray-800 bg-gray-800 text-white">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by Event" />
          </SelectTrigger>
          <SelectContent className="border-gray-800 bg-gray-800 text-white">
            <SelectItem value="all">All Events</SelectItem>
            {eventTypes.map(event => (
              <SelectItem key={event} value={event}>{event}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
