
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";
import { aiRouter } from "@/adapters/routerV2";
import { toast } from "@/hooks/use-toast";

interface APIKey {
  id: string;
  provider: string;
  model: string;
  created_at: string;
}

interface APIStatus {
  provider: string;
  model: string;
  status: 'checking' | 'success' | 'error' | 'idle';
  error?: string;
  responseTime?: number;
}

interface Props {
  apiKeys: APIKey[];
}

const APIStatusChecker: React.FC<Props> = ({ apiKeys }) => {
  const [statuses, setStatuses] = useState<APIStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkAPIStatus = async (apiKey: APIKey): Promise<APIStatus> => {
    const startTime = Date.now();
    
    try {
      // Make a simple test request to the model
      const testRequest = {
        messages: [{ role: 'user' as const, content: 'Hello' }],
        maxTokens: 10,
        temperature: 0.1
      };

      await aiRouter.execute({
        modelId: apiKey.model as any, // Type assertion needed for now
        input: testRequest
      });

      const responseTime = Date.now() - startTime;
      
      return {
        provider: apiKey.provider,
        model: apiKey.model,
        status: 'success',
        responseTime
      };
    } catch (error: any) {
      return {
        provider: apiKey.provider,
        model: apiKey.model,
        status: 'error',
        error: error.message || 'Unknown error'
      };
    }
  };

  const handleCheckAllAPIs = async () => {
    if (apiKeys.length === 0) {
      toast({
        title: "No API Keys",
        description: "Please add some API keys first.",
        variant: "destructive"
      });
      return;
    }

    setIsChecking(true);
    
    // Initialize statuses with 'checking' state
    const initialStatuses: APIStatus[] = apiKeys.map(key => ({
      provider: key.provider,
      model: key.model,
      status: 'checking'
    }));
    setStatuses(initialStatuses);

    // Check each API key
    const promises = apiKeys.map(async (apiKey, index) => {
      const result = await checkAPIStatus(apiKey);
      
      // Update individual status as it completes
      setStatuses(prev => prev.map((status, i) => 
        i === index ? result : status
      ));
      
      return result;
    });

    try {
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      
      toast({
        title: "API Status Check Complete",
        description: `${successCount} working, ${errorCount} failed`,
        variant: errorCount > 0 ? "destructive" : "default"
      });
    } catch (error) {
      toast({
        title: "Status Check Failed",
        description: "An unexpected error occurred during the check.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: APIStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: APIStatus) => {
    switch (status.status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'success':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Working {status.responseTime && `(${status.responseTime}ms)`}
          </Badge>
        );
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  if (apiKeys.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">API Status Check</h3>
        <Button
          onClick={handleCheckAllAPIs}
          disabled={isChecking}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isChecking ? 'Checking...' : 'Test All APIs'}
        </Button>
      </div>

      {statuses.length > 0 && (
        <div className="space-y-2">
          {statuses.map((status, index) => (
            <Card key={`${status.provider}-${status.model}`} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status.status)}
                  <div>
                    <div className="font-medium text-sm">
                      {status.provider} - {status.model}
                    </div>
                    {status.error && (
                      <div className="text-xs text-gray-500 mt-1">
                        {status.error}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusBadge(status)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default APIStatusChecker;
