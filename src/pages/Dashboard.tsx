
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FlowView } from "@/components/dashboard/FlowView";
import { AgentMetricsView } from "@/components/dashboard/AgentMetricsView";
import { LogsView } from "@/components/dashboard/LogsView";
import { NotificationBar } from "@/components/dashboard/NotificationBar";

type View = "flow" | "metrics" | "logs";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<View>("flow");
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <DashboardSidebar currentView={currentView} setCurrentView={setCurrentView} />
        <div className="flex flex-1 flex-col">
          <NotificationBar notifications={notifications} />
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-4">
            {currentView === "flow" && <FlowView />}
            {currentView === "metrics" && <AgentMetricsView />}
            {currentView === "logs" && <LogsView />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
