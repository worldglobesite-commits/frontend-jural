import Loader from './Loader';

// Единый вывод состояния запроса: загрузка / ошибка / пусто / данные
export default function AsyncBlock({ state, emptyText, children }) {
  if (state.status === 'loading') return <Loader />;
  if (state.status === 'failed') return <div className="alert alert-danger">{state.error}</div>;
  if (state.status === 'succeeded' && state.items.length === 0) {
    return <div className="alert alert-warning">{emptyText}</div>;
  }
  if (state.status === 'succeeded') return children;
  return null;
}
