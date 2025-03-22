import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://gukuagtoniaqquvwruzm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1a3VhZ3RvbmlhcXF1dndydXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTA0NDYsImV4cCI6MjA1ODE4NjQ0Nn0.23TDskg5YMRbNB55W4kWAZvbnmqqefDxlXuDGcJwRWY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
})