// Debug endpoint to check environment variables
export default function handler(req, res) {
  const envCheck = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  return res.status(200).json(envCheck);
}
