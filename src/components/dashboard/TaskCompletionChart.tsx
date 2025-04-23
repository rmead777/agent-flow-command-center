
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskCompletionChartProps {
  metrics: any[];
}

export function TaskCompletionChart({ metrics }: TaskCompletionChartProps) {
  return (
    <Card className="bg-gray-900 text-white border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Task Completion Rate (24h)</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#2a2a2a', border: 'none' }}
                itemStyle={{ color: '#d1d5db' }}
              />
              <Line type="monotone" dataKey="completionRate" stroke="#8b5cf6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
