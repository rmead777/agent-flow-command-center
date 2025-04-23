
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Task {
  id: string;
  status: string;
  duration: number;
  timestamp: string;
}

interface RecentTasksTableProps {
  tasks: Task[];
}

export function RecentTasksTable({ tasks }: RecentTasksTableProps) {
  return (
    <Card className="col-span-full bg-gray-900 text-white border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800">
              <TableHead className="text-gray-400">Task ID</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Duration</TableHead>
              <TableHead className="text-gray-400">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id} className="border-gray-800">
                <TableCell className="font-mono">{task.id}</TableCell>
                <TableCell>
                  <span className={`inline-block rounded-full px-2 py-1 text-xs ${
                    task.status === 'completed' 
                      ? 'bg-green-900/40 text-green-400' 
                      : task.status === 'failed'
                      ? 'bg-red-900/40 text-red-400'
                      : 'bg-yellow-900/40 text-yellow-400'
                  }`}>
                    {task.status}
                  </span>
                </TableCell>
                <TableCell>{task.duration}ms</TableCell>
                <TableCell className="text-gray-400">{task.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
