import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPublicEvents, type WebsiteEventRow } from '../lib/public-events';
const now = new Date('2026-10-05T15:00:00Z');
const row: WebsiteEventRow = { id: 'event-1', title: '読書カフェ会', starts_at: '2026-10-10T14:00:00+09:00', category: null, source_url: 'https://tunagate.com/circle/93279/events/123', status: 'published', website_visible: true };
test('projects exact fields, converts timezone, and omits private data', () => {
 const actual = projectPublicEvents([{ ...row, registrations: [{ name: 'PRIVATE' }], raw_json: { secret: true }, revenue: 123 } as WebsiteEventRow], now);
 assert.deepEqual(actual, [{ id: row.id, title: row.title, startsAt: '2026-10-10T05:00:00.000Z', category: 'BOOK', url: row.source_url }]);
});
test('omits unapproved, past, canceled, invalid and timezone-ambiguous rows', () => {
 const rows = [ { ...row, website_visible: false }, { ...row, starts_at: '2026-10-04T14:00:00+09:00' }, { ...row, status: 'cancelled' }, { ...row, status: 'draft' }, { ...row, starts_at: 'not-a-date' }, { ...row, starts_at: '2026-10-10T14:00:00' } ];
 assert.deepEqual(projectPublicEvents(rows, now), []);
});
test('sorts future events and does not expose unsafe links', () => {
 const actual = projectPublicEvents([{ ...row, id: 'later', starts_at: '2026-10-20T14:00:00+09:00', source_url: 'javascript:alert(1)' }, row], now);
 assert.equal(actual[0].id, 'event-1'); assert.equal(actual[1].url, null);
 assert.deepEqual(projectPublicEvents([], now), []);
});
