import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR-SUPABASE-URL';
const supabaseKey = 'YOUR-SUPABASE-KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
