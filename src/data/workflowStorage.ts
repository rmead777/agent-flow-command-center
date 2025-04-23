
import { supabase } from "@/integrations/supabase/client";
import { Node, Edge } from "@xyflow/react";

// Type for a stored workflow in Supabase
export interface UserFlow {
  id: string;
  user_id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  created_at: string;
  updated_at: string;
}

// Save or update a workflow
export async function saveUserFlow(name: string, nodes: Node[], edges: Edge[], flowId?: string): Promise<{ success: boolean; error?: string; id?: string }> {
  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    return { success: false, error: "Not signed in" };
  }
  const payload = {
    user_id: user.data.user.id,
    name,
    nodes,
    edges
  };

  let result;
  if (flowId) {
    // Update
    result = await supabase
      .from("user_flows")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", flowId)
      .select();
  } else {
    // Insert
    result = await supabase
      .from("user_flows")
      .insert([{ ...payload }])
      .select();
  }
  if (result.error) return { success: false, error: result.error.message };
  return { success: true, id: result.data?.[0]?.id };
}

// Get all workflows for current user
export async function listUserFlows(): Promise<UserFlow[]> {
  const user = await supabase.auth.getUser();
  if (!user.data.user) return [];
  const { data } = await supabase
    .from("user_flows")
    .select("*")
    .eq("user_id", user.data.user.id)
    .order("updated_at", { ascending: false });
  return data || [];
}

// Load a specific workflow by id
export async function loadUserFlow(id: string): Promise<UserFlow | null> {
  const { data, error } = await supabase
    .from("user_flows")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) return null;
  return data;
}
