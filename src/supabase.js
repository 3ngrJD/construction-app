// ============================================
// SUPABASE CLIENT
// ============================================

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yrbputhsoviuzohmaztn.supabase.co"
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || "sb_publishable_lMyk5AV3DRTOECvJrp8OBA_ZihXNKEW"

export const supabase = createClient(supabaseUrl, supabaseKey)