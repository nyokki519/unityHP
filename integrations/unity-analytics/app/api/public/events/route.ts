import { adminClient } from '@/lib/supabase';
import { projectPublicEvents } from '@/lib/public-events';

export const dynamic = 'force-dynamic';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS' };

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET() {
  try {
    const db = adminClient();
    if (!db) throw new Error('not_configured');
    const now = new Date();
    const { data, error } = await db.from('events')
      .select('id,title,starts_at,category,source_url,status,website_visible')
      .eq('website_visible', true)
      .gte('starts_at', now.toISOString())
      .order('starts_at', { ascending: true })
      .limit(200)
      .abortSignal(AbortSignal.timeout(8000));
    if (error) throw new Error('query_failed');
    return Response.json({ version: 1, generatedAt: now.toISOString(), events: projectPublicEvents(data || [], now) }, {
      headers: { ...cors, 'Cache-Control': 'public, max-age=60, s-maxage=60' }
    });
  } catch {
    return Response.json({ error: 'public_events_unavailable' }, {
      status: 503, headers: { ...cors, 'Cache-Control': 'no-store' }
    });
  }
}
