
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorRatesChartProps {
  metrics: any[];
}

export function ErrorRatesChart({ metrics }: ErrorRatesChartProps) {
  return (
    <Card className="bg-gray-900 text-white border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Error Rates by Type</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#2a2a2a', border: 'none' }}
                itemStyle={{ color: '#d1d5db' }}
              />
              <Legend />
              <Bar dataKey="syntaxErrors" fill="#ef4444" />
              <Bar dataKey="timeoutErrors" fill="#f59e0b" />
              <Bar dataKey="otherErrors" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
