
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';

interface FlowOutputsViewProps {
  flowOutputs: any[];
  showOutputDetails: boolean;
  setShowOutputDetails: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function FlowOutputsView({
  flowOutputs,
  showOutputDetails,
  setShowOutputDetails,
  searchTerm,
  setSearchTerm,
}: FlowOutputsViewProps) {
  return (
    <>
      <div className="mb-4">
        <Input
          placeholder="Search flow outputs..."
          className="border-gray-800 bg-gray-800 text-white placeholder:text-gray-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-400 w-40">Timestamp</TableHead>
              <TableHead className="text-gray-400">Flow Run</TableHead>
              <TableHead className="text-gray-400">Nodes</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flowOutputs.length > 0 ? (
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableCell className="text-xs text-gray-400">
                  {new Date().toLocaleString()}
                </TableCell>
                <TableCell>Last Flow Execution</TableCell>
                <TableCell>{flowOutputs.length} nodes processed</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-purple-400 hover:bg-purple-900/20 hover:text-purple-300"
                    onClick={() => setShowOutputDetails(true)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No flow outputs available. Run a flow to generate outputs.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
