import { useMemo } from 'react';
import Icon from '@/components/ui/icon';
import {
  CategoryId,
  Expense,
  categoryById,
  formatMoney,
  currentMonth,
  monthLabel,
} from '@/lib/expenses';

export const HistoryScreen = ({ expenses }: { expenses: Expense[] }) => {
  const ym = currentMonth();
  const monthItems = useMemo(
    () => expenses.filter((e) => e.date.slice(0, 7) === ym),
    [expenses, ym],
  );

  const total = monthItems.reduce((s, e) => s + e.amount, 0);

  const avgConsumption = useMemo(() => {
    const fuelWithOdo = expenses
      .filter((e) => e.category === 'fuel' && e.odometer != null && e.liters != null)
      .sort((a, b) => (a.odometer ?? 0) - (b.odometer ?? 0));
    if (fuelWithOdo.length < 2) return null;
    const totalLiters = fuelWithOdo.reduce((s, e) => s + (e.liters ?? 0), 0);
    const distance = (fuelWithOdo.at(-1)!.odometer ?? 0) - (fuelWithOdo[0].odometer ?? 0);
    if (distance <= 0) return null;
    return (totalLiters / distance) * 100;
  }, [expenses]);

  const grouped = useMemo(() => {
    const map = new Map<CategoryId, Expense[]>();
    for (const e of monthItems) {
      const arr = map.get(e.category) || [];
      arr.push(e);
      map.set(e.category, arr);
    }
    return Array.from(map.entries())
      .map(([cat, items]) => ({
        cat,
        items: items.sort((a, b) => b.date.localeCompare(a.date)),
        sum: items.reduce((s, e) => s + e.amount, 0),
      }))
      .sort((a, b) => b.sum - a.sum);
  }, [monthItems]);

  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          {monthLabel(ym)}
        </p>
        <p className="text-4xl font-extrabold tabular text-primary mt-2">{formatMoney(total)}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{monthItems.length} операций</p>
          {avgConsumption != null && (
            <p className="text-xs text-muted-foreground">
              Расход:{' '}
              <span className="text-primary font-semibold tabular">
                {avgConsumption.toFixed(1)} л/100 км
              </span>
            </p>
          )}
        </div>
      </div>

      {grouped.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-10">Расходов пока нет</p>
      )}

      <div className="space-y-5">
        {grouped.map((g) => {
          const cat = categoryById(g.cat);
          return (
            <div key={g.cat}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Icon name={cat.icon} size={16} className="text-primary" />
                  <span className="text-sm font-semibold">{cat.label}</span>
                </div>
                <span className="text-sm font-bold tabular">{formatMoney(g.sum)}</span>
              </div>
              <div className="bg-card border border-border rounded-xl divide-y divide-border">
                {g.items.map((e) => (
                  <div key={e.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] truncate">
                        {e.category === 'fuel' && e.liters ? (
                          <span>
                            {e.liters} л{e.fullTank ? ' · полный бак' : ''}
                          </span>
                        ) : (
                          e.comment || <span className="text-muted-foreground">Без описания</span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(e.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                        })}
                        {e.category === 'fuel' && e.odometer
                          ? ` · ${new Intl.NumberFormat('ru-RU').format(e.odometer)} км`
                          : ''}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular shrink-0 ml-3">
                      {formatMoney(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};