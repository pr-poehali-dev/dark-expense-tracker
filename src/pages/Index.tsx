import { useMemo, useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  CATEGORIES,
  CategoryId,
  Expense,
  categoryById,
  formatMoney,
  loadExpenses,
  saveExpenses,
  loadCar,
  saveCar,
  CarInfo,
  currentMonth,
  monthLabel,
} from '@/lib/expenses';
import { toast } from 'sonner';

type Tab = 'add' | 'history' | 'stats' | 'car';

const Index = () => {
  const [tab, setTab] = useState<Tab>('add');
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [car, setCar] = useState<CarInfo>(() => loadCar());
  const [active, setActive] = useState<CategoryId | null>(null);

  const persist = (items: Expense[]) => {
    setExpenses(items);
    saveExpenses(items);
  };

  const addExpense = (e: Expense) => {
    const items = [e, ...expenses];
    persist(items);
    setActive(null);
    toast.success('Расход сохранён', { description: formatMoney(e.amount) });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
      <div className="w-full max-w-md flex-1 flex flex-col relative">
        <header className="px-5 pt-7 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="Gauge" size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold tracking-tight leading-none">ГАРАЖ</h1>
              <p className="text-[11px] text-muted-foreground mt-1 leading-none">
                {car.model}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 pb-28">
          {tab === 'add' && (
            <AddScreen onAdd={addExpense} active={active} setActive={setActive} car={car} />
          )}
          {tab === 'history' && <HistoryScreen expenses={expenses} />}
          {tab === 'stats' && <StatsScreen expenses={expenses} />}
          {tab === 'car' && (
            <CarScreen
              car={car}
              onSave={(c) => {
                setCar(c);
                saveCar(c);
                toast.success('Данные авто обновлены');
              }}
            />
          )}
        </main>

        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </div>
  );
};

/* ---------- BOTTOM NAV ---------- */
const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: 'add', icon: 'Plus', label: 'Расход' },
  { id: 'history', icon: 'List', label: 'История' },
  { id: 'stats', icon: 'ChartColumn', label: 'Аналитика' },
  { id: 'car', icon: 'Car', label: 'Авто' },
];

const BottomNav = ({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) => (
  <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
    <div className="bg-card border border-border rounded-2xl flex items-center justify-around px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      {NAV.map((n) => {
        const on = tab === n.id;
        return (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
              on ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon name={n.icon} size={21} />
            <span className="text-[10px] font-medium tracking-tight">{n.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

/* ---------- ADD ---------- */
const AddScreen = ({
  onAdd,
  active,
  setActive,
  car,
}: {
  onAdd: (e: Expense) => void;
  active: CategoryId | null;
  setActive: (c: CategoryId | null) => void;
  car: CarInfo;
}) => {
  if (active === 'fuel') {
    return <FuelForm onAdd={onAdd} onBack={() => setActive(null)} car={car} />;
  }
  if (active) {
    return <ExpenseForm category={active} onAdd={onAdd} onBack={() => setActive(null)} />;
  }
  return (
    <div className="animate-fade-in">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
        Выберите категорию
      </p>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            style={{ animationDelay: `${i * 40}ms` }}
            className="animate-scale-in group bg-card border border-border rounded-2xl p-4 flex flex-col gap-7 text-left transition-all hover:border-primary/60 active:scale-[0.97]"
          >
            <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary transition-colors">
              <Icon
                name={c.icon}
                size={22}
                className="text-primary group-hover:text-primary-foreground transition-colors"
              />
            </div>
            <span className="text-[13px] font-semibold leading-tight">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ---------- FUEL FORM ---------- */
const FuelForm = ({
  onAdd,
  onBack,
  car,
}: {
  onAdd: (e: Expense) => void;
  onBack: () => void;
  car: CarInfo;
}) => {
  const cat = categoryById('fuel');
  const [fullTank, setFullTank] = useState(false);
  const [liters, setLiters] = useState('');
  const [amount, setAmount] = useState('');
  const [odometer, setOdometer] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const litersValue = fullTank ? car.tank : liters;

  const toggleFull = () => {
    const next = !fullTank;
    setFullTank(next);
    if (next) setLiters(car.tank);
  };

  const submit = () => {
    const sum = parseFloat(amount.replace(',', '.'));
    const lit = parseFloat(litersValue.replace(',', '.'));
    const odo = parseFloat(odometer.replace(',', '.'));
    if (!sum || sum <= 0) {
      toast.error('Введите сумму');
      return;
    }
    if (!lit || lit <= 0) {
      toast.error('Введите объём топлива');
      return;
    }
    onAdd({
      id: Date.now().toString(),
      category: 'fuel',
      amount: sum,
      date,
      comment: '',
      liters: lit,
      fullTank,
      odometer: odo || undefined,
    });
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95 transition-transform"
      >
        <Icon name="ChevronLeft" size={18} />
        Назад
      </button>

      <div className="flex items-center gap-3 mb-7">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <Icon name={cat.icon} size={24} className="text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">{cat.label}</h2>
      </div>

      <button
        onClick={toggleFull}
        className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3.5 mb-5 active:scale-[0.99] transition-transform"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium">
          <Icon name="Fuel" size={18} className="text-primary" />
          Полный бак
          <span className="text-xs text-muted-foreground">({car.tank} л)</span>
        </span>
        <span
          className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
            fullTank ? 'bg-primary' : 'bg-secondary'
          }`}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-background transition-transform ${
              fullTank ? 'translate-x-5' : ''
            }`}
          />
        </span>
      </button>

      <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
        Объём топлива
      </label>
      <div className="relative mb-5">
        <input
          inputMode="decimal"
          value={litersValue}
          disabled={fullTank}
          onChange={(e) => setLiters(e.target.value)}
          placeholder="0"
          className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-xl font-bold tabular outline-none focus:border-primary transition-colors disabled:opacity-60"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
          л
        </span>
      </div>

      <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
        Сумма
      </label>
      <div className="relative mb-5">
        <input
          autoFocus
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full bg-card border border-border rounded-xl px-4 py-4 text-3xl font-bold tabular text-primary outline-none focus:border-primary transition-colors"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
          ₽
        </span>
      </div>

      <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
        Пробег (одометр)
      </label>
      <div className="relative mb-5">
        <input
          inputMode="numeric"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          placeholder="0"
          className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-xl font-bold tabular outline-none focus:border-primary transition-colors"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-semibold text-muted-foreground">
          км
        </span>
      </div>

      <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
        Дата
      </label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-base outline-none focus:border-primary transition-colors mb-7 [color-scheme:dark]"
      />

      <button
        onClick={submit}
        className="w-full bg-primary text-primary-foreground font-bold text-base py-4 rounded-xl active:scale-[0.98] transition-transform"
      >
        Сохранить
      </button>
    </div>
  );
};

const ExpenseForm = ({
  category,
  onAdd,
  onBack,
}: {
  category: CategoryId;
  onAdd: (e: Expense) => void;
  onBack: () => void;
}) => {
  const cat = categoryById(category);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [comment, setComment] = useState('');

  const submit = () => {
    const num = parseFloat(amount.replace(',', '.'));
    if (!num || num <= 0) {
      toast.error('Введите сумму');
      return;
    }
    onAdd({
      id: Date.now().toString(),
      category,
      amount: num,
      date,
      comment: comment.trim(),
    });
  };

  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-muted-foreground text-sm mb-6 active:scale-95 transition-transform"
      >
        <Icon name="ChevronLeft" size={18} />
        Назад
      </button>

      <div className="flex items-center gap-3 mb-7">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <Icon name={cat.icon} size={24} className="text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">{cat.label}</h2>
      </div>

      <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
        Сумма
      </label>
      <div className="relative mb-5">
        <input
          autoFocus
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full bg-card border border-border rounded-xl px-4 py-4 text-3xl font-bold tabular text-primary outline-none focus:border-primary transition-colors"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
          ₽
        </span>
      </div>

      <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
        Дата
      </label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-base outline-none focus:border-primary transition-colors mb-5 [color-scheme:dark]"
      />

      <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
        Комментарий
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Например: АИ-95, полный бак"
        rows={2}
        className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-base outline-none focus:border-primary transition-colors mb-7 resize-none"
      />

      <button
        onClick={submit}
        className="w-full bg-primary text-primary-foreground font-bold text-base py-4 rounded-xl active:scale-[0.98] transition-transform"
      >
        Сохранить
      </button>
    </div>
  );
};

/* ---------- HISTORY ---------- */
const HistoryScreen = ({ expenses }: { expenses: Expense[] }) => {
  const ym = currentMonth();
  const monthItems = useMemo(
    () => expenses.filter((e) => e.date.slice(0, 7) === ym),
    [expenses, ym],
  );

  const total = monthItems.reduce((s, e) => s + e.amount, 0);

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
        <p className="text-xs text-muted-foreground mt-1">{monthItems.length} операций</p>
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

/* ---------- STATS ---------- */
const StatsScreen = ({ expenses }: { expenses: Expense[] }) => {
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

/* ---------- CAR ---------- */
const CarScreen = ({ car, onSave }: { car: CarInfo; onSave: (c: CarInfo) => void }) => {
  const [form, setForm] = useState(car);
  const set = (k: keyof CarInfo, v: string) => setForm({ ...form, [k]: v });

  const fields: { key: keyof CarInfo; label: string; suffix?: string; mode?: string }[] = [
    { key: 'model', label: 'Модель' },
    { key: 'year', label: 'Год выпуска', mode: 'numeric' },
    { key: 'tank', label: 'Объём бака', suffix: 'л', mode: 'numeric' },
    { key: 'consumption', label: 'Средний расход', suffix: 'л / 100 км', mode: 'decimal' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="bg-card border border-border rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
          <Icon name="Car" size={28} className="text-primary" />
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight">{form.model}</p>
          <p className="text-xs text-muted-foreground">
            {form.year} · бак {form.tank} л · {form.consumption} л/100км
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2">
              {f.label}
            </label>
            <div className="relative">
              <input
                inputMode={f.mode as 'numeric' | 'decimal' | 'text' | undefined}
                value={form[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-base outline-none focus:border-primary transition-colors"
              />
              {f.suffix && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {f.suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSave(form)}
        className="w-full bg-primary text-primary-foreground font-bold text-base py-4 rounded-xl active:scale-[0.98] transition-transform mt-7"
      >
        Сохранить
      </button>
    </div>
  );
};

export default Index;