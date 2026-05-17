// ============================================
// SUPABASE CLIENT
// ============================================

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://yrbputhsoviuzohmaztn.supabase.co"
const supabaseKey = "sb_publishable_lMyk5AV3DRTOECvJrp8OBA_ZihXNKEW"

export const supabase = createClient(supabaseUrl, supabaseKey)