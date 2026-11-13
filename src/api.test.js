import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchGoods } from './api';

const jsonResponse = (body, init = {}) => ({ ok: true, status: 200, json: async () => body, ...init });

afterEach(() => vi.unstubAllGlobals());

describe('fetchGoods', () => {
  it('sends number, brand and analogues flag and passes the abort signal', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ goods: [{ number: '1', brand: 'A' }] }));
    vi.stubGlobal('fetch', fetchMock);
    const { signal } = new AbortController();

    await fetchGoods({ number: '01089', brand: 'BOSCH', signal });

    const [url, options] = fetchMock.mock.calls[0];
    const params = new URL(url, 'http://localhost').searchParams;
    expect(params.get('number')).toBe('01089');
    expect(params.get('brand')).toBe('BOSCH');
    expect(params.get('analogues')).toBe('on');
    expect(params.has('key')).toBe(false);
    expect(options.signal).toBe(signal);
  });

  it('drops the empty placeholder item returned for an unknown part', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ goods: [{ number: '', brand: '' }] })));
    expect(await fetchGoods({ number: 'x' })).toEqual([]);
  });

  it('maps a network failure to a readable error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(fetchGoods({ number: 'x' })).rejects.toThrow('Не удалось связаться с сервером');
  });

  it('reports non-2xx responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, { ok: false, status: 502 })));
    await expect(fetchGoods({ number: 'x' })).rejects.toThrow('Ошибка сервера: 502');
  });

  it('reports invalid JSON', async () => {
    const json = async () => {
      throw new SyntaxError('bad json');
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(null, { json })));
    await expect(fetchGoods({ number: 'x' })).rejects.toThrow('некорректный ответ');
  });

  it('joins API-level error arrays into one message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ error: ['first', 'second'] })));
    await expect(fetchGoods({ number: 'x' })).rejects.toThrow('first; second');
  });

  it('rethrows aborts untouched', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));
    await expect(fetchGoods({ number: 'x' })).rejects.toBe(abortError);
  });
});
