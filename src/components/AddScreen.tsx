import { useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  CATEGORIES,
  CategoryId,
  Expense,
  categoryById,
  CarInfo,
} from '@/lib/expenses';
import { toast } from 'sonner';

/* ---------- ADD SCREEN ---------- */
export const AddScreen = ({
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

/* ---------- EXPENSE FORM ---------- */
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
