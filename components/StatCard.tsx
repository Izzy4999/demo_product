interface Props {
  value: string;
  label: string;
  color?: string;
}

export default function StatCard({ value, label, color = "#BE0303" }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3">
      <span className="text-2xl font-black" style={{ color }}>{value}</span>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}
