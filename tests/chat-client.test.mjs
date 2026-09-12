import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { renderHook, render, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { useReliableChat, useChatPolling } from '../src/lib/use-reliable-chat.ts';
import { ChatDeliveryStatus } from '../src/components/ChatDeliveryStatus.tsx';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://test.invalid', pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.sessionStorage = dom.window.sessionStorage;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const realFetch = globalThis.fetch;
afterEach(() => { cleanup(); sessionStorage.clear(); globalThis.fetch = realFetch; });
const reply = data => Response.json(data);
const saved = payload => ({ id: `chat_${payload.roomId}_${payload.senderType}_${payload.clientMessageId}`, content: payload.content, senderType: payload.senderType, isRead: false, createdAt: '2026-09-12T09:00:00.000Z' });

test('failed message survives repeated polls and remount, retry keeps same key', async () => {
  const requests = [];
  globalThis.fetch = async (_url, init) => {
    if (init?.method === 'POST') { requests.push(JSON.parse(init.body)); return reply({ ok: false }); }
    return reply({ ok: true, messages: [] });
  };
  let hook = renderHook(() => useReliableChat('r1', 'admin'));
  act(() => { assert.equal(hook.result.current.send('보존할 내용'), true); });
  await waitFor(() => assert.equal(hook.result.current.messages[0].delivery, 'failed'));
  await act(() => hook.result.current.refresh('r1'));
  await act(() => hook.result.current.refresh('r1'));
  assert.equal(hook.result.current.messages[0].content, '보존할 내용');
  hook.unmount();
  hook = renderHook(() => useReliableChat('r1', 'admin'));
  await waitFor(() => assert.equal(hook.result.current.messages[0]?.delivery, 'failed'));
  globalThis.fetch = async (_url, init) => {
    const payload = JSON.parse(init.body); requests.push(payload);
    return reply({ ok: true, message: saved(payload) });
  };
  act(() => { const m = hook.result.current.messages[0]; hook.result.current.send(m.content, m); });
  await waitFor(() => assert.equal(hook.result.current.messages[0].delivery, undefined));
  assert.equal(requests[0].clientMessageId, requests[1].clientMessageId);
  assert.equal(hook.result.current.messages.length, 1);
});

test('poll confirmation wins over lost POST response, no duplicate on stale poll', async () => {
  let rejectPost, payload;
  globalThis.fetch = async (_url, init) => {
    if (init?.method === 'POST') { payload = JSON.parse(init.body); return new Promise((_resolve, reject) => { rejectPost = reject; }); }
    return reply({ ok: true, messages: [saved(payload)] });
  };
  const hook = renderHook(() => useReliableChat('r1', 'visitor'));
  act(() => hook.result.current.send('안녕하세요'));
  await act(() => hook.result.current.refresh('r1'));
  await act(async () => rejectPost(new Error('lost response')));
  assert.equal(hook.result.current.messages.length, 1);
  assert.equal(hook.result.current.messages[0].delivery, undefined);
  globalThis.fetch = async () => reply({ ok: true, messages: [] });
  await act(() => hook.result.current.refresh('r1'));
  assert.equal(hook.result.current.messages.length, 1);
});

test('room switch isolates in-flight completion and prevents rapid duplicate send', async () => {
  let resolvePost, payload, count = 0;
  globalThis.fetch = async (_url, init) => {
    count++; payload = JSON.parse(init.body);
    return new Promise(resolve => { resolvePost = resolve; });
  };
  const hook = renderHook(({ room }) => useReliableChat(room, 'admin'), { initialProps: { room: 'r1' } });
  act(() => { assert.equal(hook.result.current.send('방1'), true); assert.equal(hook.result.current.send('방1'), false); });
  assert.equal(count, 1);
  hook.rerender({ room: 'r2' });
  assert.equal(hook.result.current.messages.length, 0);
  await act(async () => resolvePost(reply({ ok: true, message: saved(payload) })));
  assert.equal(hook.result.current.messages.length, 0);
  hook.rerender({ room: 'r1' });
  assert.equal(hook.result.current.messages[0].content, '방1');
  assert.equal(hook.result.current.messages[0].delivery, undefined);
});

test('failed refresh retains messages, reports error, and concurrent refresh does not overlap', async () => {
  let resolveFetch, calls = 0;
  globalThis.fetch = () => { calls++; return new Promise(resolve => { resolveFetch = resolve; }); };
  const hook = renderHook(() => useReliableChat('r1', 'admin'));
  let first;
  act(() => { first = hook.result.current.refresh('r1'); });
  await act(() => hook.result.current.refresh('r1'));
  assert.equal(calls, 1);
  await act(async () => { resolveFetch(reply({ ok: false })); await first; });
  assert.match(hook.result.current.error, /불러오지/);
});

test('failure bubble exposes a retry action, never displays a read receipt', () => {
  let retries = 0;
  const view = render(createElement(ChatDeliveryStatus, {
    message: { delivery: 'failed', error: '네트워크 실패' }, disabled: false, retry: () => { retries++; },
  }));
  assert.match(view.getByRole('alert').textContent, /전송 확인 실패/);
  assert.equal(view.queryByText(/안읽음/), null);
  fireEvent.click(view.getByRole('button', { name: '재시도' }));
  assert.equal(retries, 1);
});

test('401 preserves failed message and instructs re-login', async () => {
  globalThis.fetch = async () => Response.json({ ok: false }, { status: 401 });
  const hook = renderHook(() => useReliableChat('r1', 'admin'));
  act(() => hook.result.current.send('내용 유지'));
  await waitFor(() => assert.equal(hook.result.current.messages[0].delivery, 'failed'));
  assert.match(hook.result.current.messages[0].error, /로그인/);
});

test('poll scheduler waits for completion and backs off when hidden', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let calls = 0, finish;
  let hidden = false;
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  const task = () => { calls++; return new Promise(resolve => { finish = resolve; }); };
  const hook = renderHook(() => useChatPolling(task));
  await act(async () => t.mock.timers.tick(4000));
  assert.equal(calls, 1);
  await act(async () => t.mock.timers.tick(30000));
  assert.equal(calls, 1);
  hidden = true;
  await act(async () => finish(true));
  await act(async () => t.mock.timers.tick(29999));
  assert.equal(calls, 1);
  await act(async () => t.mock.timers.tick(1));
  assert.equal(calls, 2);
  hook.unmount();
  await act(async () => finish(true));
  hidden = false;
  t.mock.timers.reset();
});
