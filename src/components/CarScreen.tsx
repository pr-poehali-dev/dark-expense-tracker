import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { CarInfo } from '@/lib/expenses';

export const CarScreen = ({ car, onSave }: { car: CarInfo; onSave: (c: CarInfo) => void }) => {
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
