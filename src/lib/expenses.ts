export type CategoryId =
  | 'fuel'
  | 'repair'
  | 'wash'
  | 'parking'
  | 'toll'
  | 'credit'
  | 'insurance'
  | 'tires';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
}

export interface Expense {
  id: string;
  category: CategoryId;
  amount: number;
  date: string; // YYYY-MM-DD
  comment: string;
  liters?: number;
  fullTank?: boolean;
  odometer?: number;
}

export const CATEGORIES: Category[] = [
  { id: 'fuel', label: 'Заправка', icon: 'Fuel' },
  { id: 'repair', label: 'Запчасти и ремонт', icon: 'Wrench' },
  { id: 'wash', label: 'Мойка', icon: 'Droplets' },
  { id: 'parking', label: 'Парковка', icon: 'SquareParking' },
  { id: 'toll', label: 'Платные дороги', icon: 'Milestone' },
  { id: 'credit', label: 'Кредит за авто', icon: 'Landmark' },
  { id: 'insurance', label: 'Страховка', icon: 'ShieldCheck' },
  { id: 'tires', label: 'Шины', icon: 'CircleDot' },
];

export const categoryById = (id: CategoryId): Category =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];

export const formatMoney = (n: number): string =>
  new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';

const STORAGE_KEY = 'garage_expenses_v1';

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return SEED;
}

export function saveExpenses(items: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};

const SEED: Expense[] = [
  { id: 's1', category: 'fuel', amount: 3200, date: daysAgo(1), comment: 'АИ-95, полный бак' },
  { id: 's2', category: 'fuel', amount: 2950, date: daysAgo(9), comment: '' },
  { id: 's3', category: 'wash', amount: 600, date: daysAgo(3), comment: 'Комплекс' },
  { id: 's4', category: 'parking', amount: 450, date: daysAgo(4), comment: 'ТЦ' },
  { id: 's5', category: 'credit', amount: 28000, date: daysAgo(6), comment: 'Ежемесячный платёж' },
  { id: 's6', category: 'repair', amount: 7400, date: daysAgo(12), comment: 'Замена колодок' },
  { id: 's7', category: 'toll', amount: 850, date: daysAgo(7), comment: 'М-11' },
];

export interface CarInfo {
  model: string;
  year: string;
  tank: string;
  consumption: string;
}

const CAR_KEY = 'garage_car_v1';

export const DEFAULT_CAR: CarInfo = {
  model: 'BMW 5 series G30',
  year: '2021',
  tank: '68',
  consumption: '8.4',
};

export function loadCar(): CarInfo {
  try {
    const raw = localStorage.getItem(CAR_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return DEFAULT_CAR;
}

export function saveCar(car: CarInfo) {
  localStorage.setItem(CAR_KEY, JSON.stringify(car));
}

export const currentMonth = () => iso(today).slice(0, 7);

export const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-');
  const names = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];
  return `${names[Number(m) - 1]} ${y}`;
};