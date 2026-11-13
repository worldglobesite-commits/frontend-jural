// Цена берётся со складов (поле price верхнего уровня API не рекомендует использовать)
export function minPrice(item) {
  const prices = (item.warehouses || []).filter((w) => w.stock > 0).map((w) => w.price);
  return prices.length ? Math.min(...prices) : null;
}

const priceFormat = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2 });

export const formatPrice = (price) => `${priceFormat.format(price)} ₽`;
