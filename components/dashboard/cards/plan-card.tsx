interface PlanCardProps {
  name: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

export function PlanCard({ name, price, features, highlighted = false }: PlanCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${highlighted ? "border-primary bg-primary/10" : "border-white/10"}`}
    >
      <p className="font-semibold">{name}</p>
      <p className="mt-2 text-lg font-bold">{price}</p>
      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
        {features.map((feature) => (
          <li key={feature}>- {feature}</li>
        ))}
      </ul>
    </div>
  );
}
