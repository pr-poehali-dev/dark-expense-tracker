import { useState } from 'react';
import Icon from '@/components/ui/icon';
import {
  CategoryId,
  Expense,
  CarInfo,
  formatMoney,
  loadExpenses,
  saveExpenses,
  loadCar,
  saveCar,
} from '@/lib/expenses';
import { toast } from 'sonner';
import { AddScreen } from '@/components/AddScreen';
import { HistoryScreen } from '@/components/HistoryScreen';
import { StatsScreen } from '@/components/StatsScreen';
import { CarScreen } from '@/components/CarScreen';

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

export default Index;
