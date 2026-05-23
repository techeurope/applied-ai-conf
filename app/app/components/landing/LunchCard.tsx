import { UtensilsCrossed, Leaf, Wheat, Beef, Info } from "lucide-react";

const MENU = [
  { icon: Beef, label: "Meat option", note: "Chicken bowl, seasonal sides" },
  { icon: Leaf, label: "Vegetarian", note: "Roasted veg, grains, labneh" },
  { icon: Leaf, label: "Vegan", note: "Chickpea stew, flatbread" },
  { icon: Wheat, label: "Gluten-free", note: "Ask at the counter" },
];

export function LunchCard() {
  return (
    <section className="glass-card rounded-2xl p-5 space-y-3">
      <div className="space-y-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 flex items-center gap-1.5">
          <UtensilsCrossed className="size-3" strokeWidth={2} />
          // LUNCH
        </p>
        <p className="font-mono text-[11px] tracking-widest text-white/50">
          12:30 – 13:30 · Expo Hall
        </p>
      </div>

      <ul className="space-y-1.5">
        {MENU.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.label}
              className="flex items-start gap-2.5 rounded-lg ring-1 ring-white/5 bg-white/[0.02] px-3 py-2"
            >
              <Icon className="size-4 text-emerald-300 mt-0.5 shrink-0" strokeWidth={1.75} />
              <div className="min-w-0">
                <div className="text-sm text-white">{item.label}</div>
                <div className="text-xs text-white/50">{item.note}</div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-start gap-2 rounded-lg bg-white/[0.02] ring-1 ring-white/5 px-3 py-2.5">
        <Info className="size-3.5 text-white/50 mt-0.5 shrink-0" strokeWidth={1.75} />
        <p className="text-xs text-white/60 leading-relaxed">
          Allergens labelled at the counter. Let the team at Registration know about any dietary needs we missed.
        </p>
      </div>
    </section>
  );
}
