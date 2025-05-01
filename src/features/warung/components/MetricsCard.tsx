import { Info } from "lucide-react";
import { Card } from "~/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: number | string;
  iconBg?: string;
  icon: React.ReactNode;
}

export const MetricsCard = ({
  title,
  value,
  icon,
  iconBg,
}: MetricsCardProps) => {
  return (
    <Card className="bg-card flex flex-col gap-3 rounded-lg px-5 py-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold md:text-lg">{title}</h3>
        <p>3%</p>
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
