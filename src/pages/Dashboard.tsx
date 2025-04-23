
import { useState, useRef } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FlowView, FlowViewHandle } from "@/components/dashboard/FlowView";
import { AgentMetricsView } from "@/components/dashboard/AgentMetricsView";
import { LogsView } from "@/components/dashboard/LogsView";
import { NotificationBar } from "@/components/dashboard/NotificationBar";
import APIKeysPage from "@/pages/APIKeysPage";
import ModelSystemValidator from "@/components/admin/ModelSystemValidator";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type View = "flow" | "metrics" | "logs" | "api-keys" | "system-validator";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<View>("flow");
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: "error" | "warning" | "info";
      timestamp: Date;
    }>
  >([
    {
      id: "1",
      message: "Agent X has failed 5 tasks in the last hour",
      type: "error",
      timestamp: new Date(),
    },
    {
      id: "2",
      message: "High latency detected in Agent Y",
      type: "warning",
      timestamp: new Date(),
    },
  ]);

  // --- Master user prompt state ---
  const [masterUserPrompt, setMasterUserPrompt] = useState<string>("");

  // --- FlowView ref for button handlers ---
  const flowViewRef = useRef<FlowViewHandle>(null);

  // --- Callbacks for DashboardHeader buttons ---
  const handleRunFlow = () => {
    flowViewRef.current?.runFlow();
  };
  const handleSaveFlow = () => {
    flowViewRef.current?.saveFlow();
  };
  const handleCode = () => {
    flowViewRef.current?.showCode();
  };
  const handleSettings = () => {
    flowViewRef.current?.showSettings();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <DashboardSidebar currentView={currentView} setCurrentView={setCurrentView as any} />
        <div className="flex flex-1 flex-col">
          <NotificationBar notifications={notifications} />
          <DashboardHeader
            onRunFlow={handleRunFlow}
            onSaveFlow={handleSaveFlow}
            onCode={handleCode}
            onSettings={handleSettings}
          />
          {/* Show master user prompt field only on the flow view */}
          {currentView === "flow" && (
            <div className="bg-gray-950 border-b border-gray-800 p-3 flex gap-2 items-center">
              <label htmlFor="masterUserPrompt" className="text-sm font-medium text-gray-300 mr-2 flex-shrink-0">User Prompt:</label>
              <Input
                id="masterUserPrompt"
                type="text"
                className="bg-gray-900 border-gray-700 text-gray-100 w-full"
                value={masterUserPrompt}
                onChange={e => setMasterUserPrompt(e.target.value)}
                placeholder="Enter prompt for this run (optional)"
                autoComplete="off"
              />
            </div>
          )}
          <main className="flex-1 overflow-auto p-4">
            <div className={isMobile ? "h-[500px]" : "h-[calc(100vh-130px)]"}>
              {currentView === "flow" && (
                <FlowView
                  ref={flowViewRef}
                  masterUserPrompt={masterUserPrompt}
                />
              )}
              {currentView === "metrics" && <AgentMetricsView />}
              {currentView === "logs" && <LogsView />}
              {currentView === "api-keys" && <APIKeysPage />}
              {currentView === "system-validator" && (
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-2xl font-bold mb-6">System Validation</h1>
                  <ModelSystemValidator />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
