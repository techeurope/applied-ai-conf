import { UtensilsCrossed, Leaf, Wheat, Beef, Info } from "lucide-react";

const MENU = [
  { icon: Beef, label: "Meat option", note: "Chicken bowl, seasonal sides" },
  { icon: Leaf, label: "Vegetarian", note: "Roasted veg, grains, labneh" },
  { icon: Leaf, label: "Vegan", note: "Chickpea stew, flatbread" },
  { icon: Wheat, label: "Gluten-free", note: "Ask at the counter" },
];

export function LunchCard() {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        <h2 className="font-mono text-lg font-semibold text-white">Lunch</h2>
      </div>

      <div className="text-xs text-neutral-500 mb-5 font-mono">
        12:30 – 13:30 · Lunch Area
      </div>

      <ul className="space-y-2">
        {MENU.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.label}
              className="flex items-start gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2.5"
            >
              <Icon className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm text-white">{item.label}</div>
                <div className="text-xs text-neutral-500">{item.note}</div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2.5">
        <Info className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
        <p className="text-xs text-neutral-400 leading-relaxed">
          Allergens labelled at the counter. Let the team at Registration know about any
          dietary needs we missed.
        </p>
      </div>
    </div>
  );
}
