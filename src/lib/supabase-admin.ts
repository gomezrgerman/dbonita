import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — only initialized on first call inside a request handler,
// never at module load time (avoids build-time failure when key is absent locally).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any> | undefined

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAdmin(): SupabaseClient<any> {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _client
}
