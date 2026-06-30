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

export const StatsScreen = ({ expenses }: { expenses: Expense[] }) => {
  const ym = currentMonth();
  const monthItems = expenses.filter((e) => e.date.slice(0, 7) === ym);
  const total = monthItems.reduce((s, e) => s + e.amount, 0);

  const byCat = useMemo(() => {
    const map = new Map<CategoryId, number>();
    for (const e of monthItems) map.set(e.category, (map.get(e.category) || 0) + e.amount);
    return Array.from(map.entries())
      .map(([cat, sum]) => ({ cat, sum }))
      .sort((a, b) => b.sum - a.sum);
  }, [monthItems]);

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      const m = e.date.slice(0, 7);
      map.set(m, (map.get(m) || 0) + e.amount);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);
  }, [expenses]);

  const maxMonth = Math.max(...byMonth.map((m) => m[1]), 1);

  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Расходы · {monthLabel(ym)}
        </p>
        <p className="text-4xl font-extrabold tabular text-primary mt-2">{formatMoney(total)}</p>
      </div>

      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">
        По категориям
      </p>
      <div className="space-y-3 mb-8">
        {byCat.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-6">Нет данных</p>
        )}
        {byCat.map((c) => {
          const cat = categoryById(c.cat);
          const pct = total ? Math.round((c.sum / total) * 100) : 0;
          return (
            <div key={c.cat}>
              <div className="flex items-center justify-between mb-1.5 text-[13px]">
                <span className="flex items-center gap-2 font-medium">
                  <Icon name={cat.icon} size={14} className="text-primary" />
                  {cat.label}
                </span>
                <span className="tabular text-muted-foreground">
                  {formatMoney(c.sum)} · {pct}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">
        Динамика по месяцам
      </p>
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-end justify-between gap-2 h-40">
          {byMonth.map(([m, sum]) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] tabular text-muted-foreground">
                {Math.round(sum / 1000)}к
              </span>
              <div
                className="w-full rounded-t-md bg-primary/80 transition-all"
                style={{ height: `${(sum / maxMonth) * 100}%`, minHeight: '6px' }}
              />
              <span className="text-[10px] text-muted-foreground uppercase">
                {monthLabel(m).split(' ')[0].slice(0, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
