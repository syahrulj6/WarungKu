import { Card } from "~/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: number | string;
  iconBg?: string;
  icon: React.ReactNode;
  change?: number;
}

export const MetricsCard = ({
  title,
  value,
  icon,
  iconBg,
  change,
}: MetricsCardProps) => {
  const getChangeColor = () => {
    if (!change) return "text-muted-foreground";
    return change >= 0 ? "text-green-500" : "text-red-500";
  };

  const getChangeIcon = () => {
    if (!change) return null;
    return change >= 0 ? "↑" : "↓";
  };

  return (
    <Card className="bg-card flex flex-col gap-3 rounded-lg px-5 py-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold md:text-base">{title}</h3>
        {change !== undefined && (
          <span className={`text-sm ${getChangeColor()}`}>
            {getChangeIcon()} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-fit w-fit justify-center rounded-full p-3 text-white ${iconBg ? iconBg : "bg-muted-foreground"}`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{value}</h3>
      </div>
    </Card>
  );
};
