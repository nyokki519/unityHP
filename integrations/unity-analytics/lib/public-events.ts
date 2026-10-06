/** Public projection only; never return participants, raw_json, or analytics metrics. */
export type WebsiteEventRow = {
  id: string;
  title: string;
  starts_at: string | null;
  category: string | null;
  source_url: string | null;
  status: string | null;
  website_visible: boolean;
};

const hiddenStatuses = new Set(['draft', 'private', 'deleted', 'cancelled', 'canceled', '中止', '非公開', '下書き']);
const categories = new Set(['CAFE', 'BOOK', 'BEAUTY', 'LATTE ART', 'BOARD GAME', 'SPORT', 'COMMUNITY']);

function publicUrl(input: string | null): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

function categoryFor(row: WebsiteEventRow) {
  const supplied = row.category?.trim().toUpperCase();
  if (supplied && categories.has(supplied)) return supplied;
  if (/ラテ|latte/i.test(row.title)) return 'LATTE ART';
  if (/読書|本|book/i.test(row.title)) return 'BOOK';
  if (/美容|beauty/i.test(row.title)) return 'BEAUTY';
  if (/ボードゲーム|board.?game/i.test(row.title)) return 'BOARD GAME';
  if (/ダーツ|フットサル|スポーツ|sport|darts/i.test(row.title)) return 'SPORT';
  if (/カフェ|cafe/i.test(row.title)) return 'CAFE';
  return 'COMMUNITY';
}

export function projectPublicEvents(rows: WebsiteEventRow[], now = new Date()) {
  return rows.flatMap(row => {
    if (row.website_visible !== true || hiddenStatuses.has(row.status?.trim().toLowerCase() || '')) return [];
    if (!row.title?.trim() || !row.starts_at || !/(?:Z|[+-]\d{2}:\d{2})$/.test(row.starts_at)) return [];
    const timestamp = Date.parse(row.starts_at);
    if (!Number.isFinite(timestamp) || timestamp < now.getTime()) return [];
    return [{
      id: row.id,
      title: row.title.trim(),
      startsAt: new Date(timestamp).toISOString(),
      category: categoryFor(row),
      url: publicUrl(row.source_url)
    }];
  }).sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, 30);
}
