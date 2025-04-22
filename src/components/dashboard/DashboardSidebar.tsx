
import { Home, BarChart3, FileText, Key } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  currentView: "flow" | "metrics" | "logs" | "api-keys";
  setCurrentView: (view: "flow" | "metrics" | "logs" | "api-keys") => void;
}

export function DashboardSidebar({
  currentView,
  setCurrentView,
}: DashboardSidebarProps) {
  const menuItems = [
    {
      title: "Flow Overview",
      view: "flow" as const,
      icon: Home,
    },
    {
      title: "Agent Metrics",
      view: "metrics" as const,
      icon: BarChart3,
    },
    {
      title: "Logs",
      view: "logs" as const,
      icon: FileText,
    },
    {
      title: "API Keys",
      view: "api-keys" as const,
      icon: Key,
    },
  ];

  return (
    <Sidebar variant="sidebar" className="border-r border-gray-800">
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold text-purple-400">Agent Flow</h2>
        <p className="text-sm text-gray-400">Command Center</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.view}>
              <SidebarMenuButton
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 ${
                  currentView === item.view
                    ? "bg-purple-900/50 text-purple-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setCurrentView(item.view)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
