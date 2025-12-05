// Run this in browser console to clear Supabase session
if (typeof window !== 'undefined') {
  localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
  localStorage.removeItem('supabase.auth.token');
  console.log('✅ Cleared Supabase session. Please refresh the page.');
}
