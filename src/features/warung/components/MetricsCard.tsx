interface MetricsCardProps {
  title: string;
  value: string;
  iconBg: string;
  icon: React.ReactNode;
  change?: number;
  showChange?: boolean;
}

export const MetricsCard = ({
  title,
  value,
  iconBg,
  icon,
  change = 0,
  showChange = true,
}: MetricsCardProps) => {
  return (
    <div className="h-[120px] rounded-lg border p-4 shadow-sm">
      <div className="flex h-full items-center justify-between">
        <div className="flex h-full flex-col justify-between">
          {" "}
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          {showChange && (
            <p
              className={`text-sm ${change > 0 ? "text-green-500" : "invisible"}`}
            >
              {change > 0 ? "+" : ""}
              {change.toFixed(1)}% dari periode sebelumnya
            </p>
          )}
        </div>
        <div className={`${iconBg} rounded-md p-3 text-white`}>{icon}</div>
      </div>
    </div>
  );
};
