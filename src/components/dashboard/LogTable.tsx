
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';

interface LogTableProps {
  logs: any[];
}

export function LogTable({ logs }: LogTableProps) {
  return (
    <div className="rounded-md border border-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-800 hover:bg-transparent">
            <TableHead className="text-gray-400 w-40">Timestamp</TableHead>
            <TableHead className="text-gray-400">Agent Name</TableHead>
            <TableHead className="text-gray-400">Event Type</TableHead>
            <TableHead className="text-gray-400">Details</TableHead>
            <TableHead className="text-gray-400 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id} className={`border-gray-800 hover:bg-gray-800/50 ${
                log.eventType === 'error' ? 'bg-red-900/10' : ''
              }`}>
                <TableCell className="text-xs text-gray-400">{log.timestamp}</TableCell>
                <TableCell>{log.agentName}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                    log.eventType === 'error' 
                      ? 'bg-red-900/40 text-red-400' 
                      : log.eventType === 'warning'
                      ? 'bg-yellow-900/40 text-yellow-400'
                      : log.eventType === 'info'
                      ? 'bg-blue-900/40 text-blue-400'
                      : 'bg-green-900/40 text-green-400'
                  }`}>
                    {log.eventType === 'error' && <AlertTriangle className="mr-1 h-3 w-3" />}
                    {log.eventType}
                  </span>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {log.details}
                </TableCell>
                <TableCell className="text-right">
                  {log.eventType === 'error' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
                    >
                      Debug
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No logs match the current filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
