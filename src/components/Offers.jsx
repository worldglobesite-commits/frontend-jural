import { formatPrice, minPrice } from '../utils/price';

export default function Offers({ items }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>Название / Производитель</th>
            <th>Номер</th>
            <th className="text-end">Цена</th>
            <th className="text-end">Остаток</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const price = minPrice(item);
            return (
              <tr key={`${item.goodsID}-${i}`}>
                <td>
                  {item.name}
                  <div className="text-muted small">
                    {item.brand} {item.isOriginal && <span className="badge bg-success ms-1">искомая деталь</span>}
                  </div>
                </td>
                <td>{item.number}</td>
                <td className="text-end">{price === null ? '—' : formatPrice(price)}</td>
                <td className="text-end">{item.count} шт.</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
