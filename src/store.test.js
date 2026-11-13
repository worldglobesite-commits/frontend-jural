import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchGoods } from './api';
import { makeStore, reset, searchBrands, searchOffers } from './store';

vi.mock('./api', () => ({ fetchGoods: vi.fn() }));

const deferred = () => {
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  return { promise, resolve };
};

let store;
beforeEach(() => {
  vi.mocked(fetchGoods).mockReset();
  store = makeStore();
});

describe('parts store', () => {
  it('keeps one item per brand', async () => {
    fetchGoods.mockResolvedValue([
      { brand: 'A', name: 'first' },
      { brand: 'A', name: 'duplicate' },
      { brand: 'B', name: 'second' },
    ]);
    await store.dispatch(searchBrands('123'));

    const { brands } = store.getState().parts;
    expect(brands.status).toBe('succeeded');
    expect(brands.items.map((g) => g.brand)).toEqual(['A', 'B']);
  });

  it('returns the requested part followed by its analogues', async () => {
    fetchGoods.mockResolvedValue([{ number: '1', brand: 'A', analogues: [{ number: '2', brand: 'B' }] }]);
    await store.dispatch(searchOffers({ number: '1', brand: 'A' }));

    const { items } = store.getState().parts.offers;
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ number: '1', isOriginal: true });
    expect(items[1].number).toBe('2');
  });

  it('stores the error message when a request fails', async () => {
    fetchGoods.mockRejectedValue(new Error('boom'));
    await store.dispatch(searchBrands('123'));

    expect(store.getState().parts.brands).toMatchObject({ status: 'failed', error: 'boom' });
  });

  it('ignores the response of an outdated brands request', async () => {
    const slow = deferred();
    fetchGoods.mockReturnValueOnce(slow.promise).mockResolvedValueOnce([{ brand: 'NEW' }]);

    const first = store.dispatch(searchBrands('old'));
    await store.dispatch(searchBrands('new'));
    slow.resolve([{ brand: 'OLD' }]);
    await first;

    const { number, brands } = store.getState().parts;
    expect(number).toBe('new');
    expect(brands.items.map((g) => g.brand)).toEqual(['NEW']);
  });

  it('ignores offers that arrive after a new brands search started', async () => {
    const slow = deferred();
    fetchGoods.mockReturnValueOnce(slow.promise).mockResolvedValueOnce([{ brand: 'B' }]);

    const offers = store.dispatch(searchOffers({ number: '1', brand: 'A' }));
    await store.dispatch(searchBrands('2'));
    slow.resolve([{ number: '1', brand: 'A' }]);
    await offers;

    expect(store.getState().parts.offers.status).toBe('idle');
  });

  it('ignores an in-flight response after reset', async () => {
    const slow = deferred();
    fetchGoods.mockReturnValueOnce(slow.promise);

    const request = store.dispatch(searchBrands('1'));
    store.dispatch(reset());
    slow.resolve([{ brand: 'A' }]);
    await request;

    expect(store.getState().parts.brands.status).toBe('idle');
  });
});
