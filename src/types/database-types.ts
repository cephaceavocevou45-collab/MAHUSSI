// Minimal database type stub — the app uses untyped queries via .from() calls.
// Supabase client is typed with this to satisfy TS; runtime queries work regardless.
export interface Database {
  public: {
    Tables: Record<string, any>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
