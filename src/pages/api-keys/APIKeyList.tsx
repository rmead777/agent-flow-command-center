
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Key, Trash2 } from "lucide-react";

interface APIKey {
  id: string;
  provider: string;
  model: string;
  created_at: string;
}

interface Props {
  apiKeys: APIKey[];
  loading: boolean;
  onDelete: (provider: string, model: string) => void;
}

const APIKeyList: React.FC<Props> = ({ apiKeys, loading, onDelete }) => {
  console.log("Rendering API Keys list:", apiKeys);
  
  if (loading) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your API keys...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (apiKeys.length === 0) {
    return (
      <Card className="mt-8 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Key className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No API keys yet</h3>
          <p className="text-muted-foreground">Add an API key above to connect to AI providers</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2">
        <Key className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Your API Keys</h2>
        <Badge variant="secondary" className="ml-2">
          {apiKeys.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {apiKeys.map((key) => (
          <Card key={key.id} className="transition-all hover:shadow-sm">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="font-medium">
                    {key.provider}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground">
                    {key.model}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Added on {new Date(key.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(key.provider, key.model)}
                disabled={loading}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default APIKeyList;
