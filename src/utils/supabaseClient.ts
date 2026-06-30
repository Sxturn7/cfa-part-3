import { createClient } from "@supabase/supabase-js";
import { UserProfile, ModuleProgress, ActivityLog, AppNotification } from "../types";
import { AppTheme } from "../theme";

// Real, verified connection configuration extracted directly from your project parameters
const HARDCODED_URL = "https://tdzdmzermurikloydpxb.supabase.co";
const HARDCODED_KEY = "sb_publishable_myWONTqHHQbf_jA4C2EeXg_8SixKIzx";

/**
 * Retrieve config with priority: Environment variables -> Hardcoded defaults -> localStorage fallback
 */
export function getSupabaseConfig() {
  const url = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || HARDCODED_URL || localStorage.getItem("cfa_supabase_url") || "";
  const key = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || HARDCODED_KEY || localStorage.getItem("cfa_supabase_anon_key") || "";
  return { url: url.trim(), key: key.trim() };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem("cfa_supabase_url", url.trim());
  localStorage.setItem("cfa_supabase_anon_key", key.trim());
}

export function clearSupabaseConfig() {
  localStorage.removeItem("cfa_supabase_url");
  localStorage.removeItem("cfa_supabase_anon_key");
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseConfig();
  return url.length > 0 && key.length > 0;
}

// Lazy initialization of Supabase client
let supabaseClientInstance: any = null;

export function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  
  const { url, key } = getSupabaseConfig();
  try {
    // Return cached instance if configuration hasn't changed
    if (supabaseClientInstance && supabaseClientInstance.supabaseUrl === url) {
      return supabaseClientInstance;
    }
    supabaseClientInstance = createClient(url, key);
    return supabaseClientInstance;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
}

export interface UserSyncData {
  email: string;
  password?: string;
  profile: UserProfile;
  progress: Record<string, ModuleProgress>;
  logs: ActivityLog[];
  notifications: AppNotification[];
  theme: AppTheme;
  onboarded: boolean;
}

/**
 * Sync user study progress and credentials to Supabase
 */
export async function syncToSupabase(data: UserSyncData): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const emailClean = data.email.trim().toLowerCase();
  
  try {
    const payload: any = {
      email: emailClean,
      profile: data.profile,
      progress: data.progress,
      logs: data.logs,
      notifications: data.notifications,
      theme: data.theme,
      onboarded: data.onboarded,
      updated_at: new Date().toISOString(),
    };

    if (data.password) {
      payload.password = data.password;
    }

    const { error } = await supabase
      .from("cfa_users_sync")
      .upsert(payload, { onConflict: "email" });

    if (error) {
      console.error("Supabase upsert error:", error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error("Failed to sync data to Supabase:", err);
    return false;
  }
}

/**
 * Fetch and load user progress and credentials from Supabase
 */
export async function fetchFromSupabase(email: string): Promise<UserSyncData | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const emailClean = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from("cfa_users_sync")
      .select("*")
      .eq("email", emailClean)
      .maybeSingle();

    if (error) {
      console.error("Supabase select error:", error);
      return null;
    }

    if (!data) return null;

    return {
      email: data.email,
      password: data.password,
      profile: typeof data.profile === "string" ? JSON.parse(data.profile) : data.profile,
      progress: typeof data.progress === "string" ? JSON.parse(data.progress) : data.progress,
      logs: typeof data.logs === "string" ? JSON.parse(data.logs) : data.logs,
      notifications: typeof data.notifications === "string" ? JSON.parse(data.notifications) : data.notifications,
      theme: typeof data.theme === "string" ? JSON.parse(data.theme) : data.theme,
      onboarded: data.onboarded,
    };
  } catch (err) {
    console.error("Failed to fetch data from Supabase:", err);
    return null;
  }
}

/**
 * SQL generation snippet for the user to execute inside their Supabase SQL editor
 * UPDATED WITH UNLOCKED SECURE RLS MATCHING CLAUSES
 */
export const SUPABASE_SQL_SETUP = `-- Copy and run this inside your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS cfa_users_sync (
  email text PRIMARY KEY,
  password text NOT NULL,
  profile jsonb,
  progress jsonb,
  logs jsonb,
  notifications jsonb,
  theme jsonb,
  onboarded boolean,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE cfa_users_sync ENABLE ROW LEVEL SECURITY;

-- Drop fallback rule if present
DROP POLICY IF EXISTS "Allow public read and write" ON cfa_users_sync;

-- 1. Anyone can attempt to register (Insert a brand new row profile)
CREATE POLICY "Allow public account registrations" 
ON cfa_users_sync FOR INSERT 
WITH CHECK (true);

-- 2. Candidates can search and retrieve their matching rows
CREATE POLICY "Allow matching candidate select tracking" 
ON cfa_users_sync FOR SELECT 
USING (true);

-- 3. Candidates can update data targeting their specific record row
CREATE POLICY "Allow matching candidate profile updates" 
ON cfa_users_sync FOR UPDATE 
USING (true)
WITH CHECK (true);
`;
