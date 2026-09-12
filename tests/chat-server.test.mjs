import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

const delivery = loadTs('src/lib/chat-delivery.ts');
const { runtimeDatabaseUrl } = loadTs('src/lib/database-url.ts');
const key = 'a62c2b48-a390-4a28-8d74-799018d6d125';

test('runtime pooler retains credentials/schema and bounds connections; direct/backup URLs untouched', () => {
  const original = 'postgresql://demo:p%40ss@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?schema=calendar&sslmode=require';
  const url = new URL(runtimeDatabaseUrl(original));
  assert.equal(url.port, '6543');
  assert.equal(url.password, 'p%40ss');
  assert.equal(url.searchParams.get('schema'), 'calendar');
  assert.equal(url.searchParams.get('sslmode'), 'require');
  assert.equal(url.searchParams.get('pgbouncer'), 'true');
  assert.equal(url.searchParams.get('connection_limit'), '1');
  assert.equal(url.searchParams.get('pool_timeout'), '10');
  assert.equal(new URL(original).port, '5432');
  const direct = 'postgresql://demo:pass@db.example.com:5432/postgres?schema=calendar';
  assert.equal(runtimeDatabaseUrl(direct), direct);
  assert.equal(runtimeDatabaseUrl(undefined), undefined);
  assert.equal(new URL(runtimeDatabaseUrl(original.replace(':5432', ':6543'))).searchParams.get('pgbouncer'), 'true');
});

test('poll merge retains failed and acknowledged messages; does not downgrade read receipts', () => {
  const failed = { id: '1', createdAt: '2026-09-12', delivery: 'failed' };
  assert.deepEqual(delivery.mergeMessages([failed], []), [failed]);
  const saved = { id: '1', createdAt: '2026-09-12', isRead: true };
  const merged = delivery.mergeMessages([failed], [saved]);
  assert.equal(merged[0].delivery, undefined);
  assert.deepEqual(delivery.failMessage(merged, '1', 'timeout'), merged);
  assert.equal(delivery.mergeMessages(merged, [{ ...saved, isRead: false }])[0].isRead, true);
  assert.deepEqual(delivery.mergeMessages(merged, []), merged);
});

function fixture(options = {}) {
  const rows = new Map();
  const after = [];
  let pushes = 0, updates = 0, creates = 0;
  let tail = Promise.resolve();
  const prisma = {
    chatRoom: { findFirst: async () => options.owner === false ? null : { id: 'r1' }, findUnique: async () => ({ visitorId: 'v1', visitor: { nickname: '테스트' } }) },
    chatMessage: {
      findUnique: async ({ where }) => rows.get(where.id) || null,
      findMany: async args => { assert.equal(args.orderBy[0].createdAt, 'desc'); return [{ id: 'new' }, { id: 'old' }]; },
    },
    $transaction: async work => {
      let release;
      const before = tail;
      tail = new Promise(resolve => { release = resolve; });
      await before;
      const staged = new Map(rows);
      try {
        const result = await work({
          chatMessage: { create: async ({ data }) => {
            creates++;
            if (options.failCreate) throw new Error('EMAXCONNSESSION');
            const row = { ...data, id: data.id || `legacy-${creates}`, isRead: false, createdAt: new Date().toISOString() };
            if (staged.has(row.id)) throw Object.assign(new Error('duplicate'), { code: 'P2002' });
            staged.set(row.id, row);
            return row;
          } },
          chatRoom: { update: async () => { if (options.failUpdate) throw new Error('update failed'); updates++; } },
        });
        staged.forEach((v, k) => rows.set(k, v));
        return result;
      } finally { release(); }
    },
  };
  const route = loadTs('src/app/api/chat/messages/route.ts', {
    'next/server': { NextResponse: { json: (data, init) => Response.json(data, init) }, after: work => after.push(work) },
    'next/headers': { cookies: async () => ({ get: name => options.noAuth ? undefined : { value: name === 'visitor_id' ? 'visitor' : 'admin' } }) },
    '@/lib/db': prisma,
    '@/lib/chat-delivery': delivery,
    '@/lib/push': { sendPushToAdmin: async () => { pushes++; }, sendPushToVisitor: async () => { pushes++; if (options.failPush) throw new Error('push down'); } },
  });
  const post = (overrides = {}) => route.POST(new Request('http://localhost/api/chat/messages', {
    method: 'POST', body: JSON.stringify({ roomId: 'r1', senderType: 'admin', content: '테스트', clientMessageId: key, ...overrides }),
  }));
  return { route, post, rows, after, stats: () => ({ pushes, updates, creates }) };
}

test('retry after lost response and concurrent double-send save once and schedule one push', async () => {
  const f = fixture();
  const [a, b] = await Promise.all([f.post(), f.post()]);
  assert.equal(a.status, 200); assert.equal(b.status, 200);
  assert.equal((await a.json()).message.id, (await b.json()).message.id);
  assert.equal((await f.post()).status, 200);
  assert.equal(f.rows.size, 1); assert.equal(f.after.length, 1); assert.equal(f.stats().updates, 1);
  await f.after[0](); assert.equal(f.stats().pushes, 1);
});

test('same key different content conflicts; different room or sender is independent', async () => {
  const f = fixture();
  assert.equal((await f.post()).status, 200);
  assert.equal((await f.post({ content: 'changed' })).status, 409);
  assert.equal((await f.post({ roomId: 'r2' })).status, 200);
  assert.equal((await f.post({ senderType: 'visitor' })).status, 200);
  assert.equal(f.rows.size, 3);
});

test('database create/update failure rolls back and never pushes', async () => {
  for (const option of ['failCreate', 'failUpdate']) {
    const f = fixture({ [option]: true });
    assert.equal((await f.post()).status, 500);
    assert.equal(f.rows.size, 0); assert.equal(f.after.length, 0);
  }
});

test('push failure cannot turn a durable save into a failed POST', async () => {
  const f = fixture({ failPush: true });
  assert.equal((await f.post()).status, 200);
  await assert.doesNotReject(f.after[0]);
  assert.equal(f.rows.size, 1);
  assert.equal((await f.post()).status, 200);
  assert.equal(f.stats().pushes, 1);
});

test('reject unauthenticated/foreign-room/invalid requests; support old clients', async () => {
  assert.equal((await fixture({ noAuth: true }).post()).status, 401);
  assert.equal((await fixture({ owner: false }).post({ senderType: 'visitor' })).status, 403);
  assert.equal((await fixture().post({ content: {} })).status, 400);
  assert.equal((await fixture().post({ clientMessageId: 'bad-key' })).status, 400);
  assert.equal((await fixture().post({ clientMessageId: undefined })).status, 200);
});

test('poll returns latest window in chronological order without caching', async () => {
  const f = fixture();
  const response = await f.route.GET(new Request('http://localhost/api/chat/messages?roomId=r1'));
  assert.deepEqual((await response.json()).messages.map(m => m.id), ['old', 'new']);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
