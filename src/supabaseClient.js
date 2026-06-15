import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jzqlxndlqfbenejndaib.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cWx4bmRscWZiZW5lam5kYWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MzE5NjcsImV4cCI6MjA5NDMwNzk2N30.yUGBXPBRh2I5zarTjsrfubu1lDLwTOk1aWXO34Adz5A';

// IMPORTANT: auth storage MUST be sessionStorage so sessions persist on page
// refresh but are cleared when the browser/tab is closed. This is by design.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: window.sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});
