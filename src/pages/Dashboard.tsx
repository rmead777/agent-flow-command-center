
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
          <main className="flex-1 overflow-auto p-4">
            <div className={isMobile ? "h-[500px]" : "h-[calc(100vh-130px)]"}>
              {currentView === "flow" && <FlowView ref={flowViewRef} />}
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
