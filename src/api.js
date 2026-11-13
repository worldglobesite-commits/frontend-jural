// Ключ API добавляется прокси на сервере, в клиентском коде его нет
const API_URL = '/api';

const isAbort = (e) => e?.name === 'AbortError';

// Возвращает массив goods или бросает Error с понятным сообщением.
// Отмену запроса (AbortError) пробрасывает как есть.
export async function fetchGoods({ number, brand, signal }) {
  const params = new URLSearchParams({ number });
  if (brand) {
    params.set('brand', brand);
    params.set('analogues', 'on');
  }

  let response;
  try {
    response = await fetch(`${API_URL}?${params}`, { signal });
  } catch (e) {
    if (isAbort(e)) throw e;
    throw new Error('Не удалось связаться с сервером. Проверьте подключение к сети.');
  }
  if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);

  let data;
  try {
    data = await response.json();
  } catch (e) {
    if (isAbort(e)) throw e;
    throw new Error('Сервер вернул некорректный ответ.');
  }
  if (data.error) {
    throw new Error(Array.isArray(data.error) ? data.error.join('; ') : String(data.error));
  }
  // Для ненайденной детали API возвращает один пустой элемент
  return (data.goods || []).filter((g) => g.number || g.brand);
}
