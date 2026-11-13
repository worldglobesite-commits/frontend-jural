import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reset, searchBrands, searchOffers } from './store';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import AsyncBlock from './components/AsyncBlock';
import Brands from './components/Brands';
import Offers from './components/Offers';

const SEARCH_DEBOUNCE_MS = 500;
const MIN_QUERY_LENGTH = 3;

export default function App() {
  const dispatch = useDispatch();
  const { number, brand, brands, offers } = useSelector((s) => s.parts);
  const [input, setInput] = useState('');
  const query = useDebouncedValue(input.trim(), SEARCH_DEBOUNCE_MS);

  const lastQuery = useRef('');
  const brandsRequest = useRef(null);
  const offersRequest = useRef(null);

  const runSearch = useCallback(
    (value, { force = false } = {}) => {
      if (!force && value === lastQuery.current) return;
      lastQuery.current = value;

      // Отменяем запросы предыдущего поиска, чтобы они не занимали соединение
      brandsRequest.current?.abort();
      offersRequest.current?.abort();

      if (value.length >= MIN_QUERY_LENGTH) brandsRequest.current = dispatch(searchBrands(value));
      else dispatch(reset());
    },
    [dispatch]
  );

  useEffect(() => {
    runSearch(query);
  }, [query, runSearch]);

  const onSubmit = (e) => {
    e.preventDefault();
    const value = input.trim();
    runSearch(value, { force: true });
  };

  const onSelectBrand = (b) => {
    offersRequest.current?.abort();
    offersRequest.current = dispatch(searchOffers({ number, brand: b }));
  };

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <h1 className="h3 mb-4">Поиск автозапчастей и аналогов</h1>

      <form className="input-group mb-4" onSubmit={onSubmit}>
        <input
          className="form-control"
          placeholder={`Введите артикул (от ${MIN_QUERY_LENGTH} символов), например 01089`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </form>

      {brands.status !== 'idle' && (
        <section className="mb-4">
          <h2 className="h5">1. Производители артикула «{number}»</h2>
          <AsyncBlock state={brands} emptyText="Деталь с таким артикулом не найдена.">
            <Brands brands={brands.items} selected={brand} onSelect={onSelectBrand} />
          </AsyncBlock>
        </section>
      )}

      {offers.status !== 'idle' && (
        <section>
          <h2 className="h5">2. Предложения и аналоги: {brand}</h2>
          <AsyncBlock state={offers} emptyText="Предложений не найдено.">
            <Offers items={offers.items} />
          </AsyncBlock>
        </section>
      )}
    </div>
  );
}
