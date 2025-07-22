import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { PieChart, Pie, Label, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "~/components/ui/chart";
import { TrendingDown, TrendingUp } from "lucide-react";

interface PieChartCardProps {
  data: { name: string; value: number; fill: string }[];
  totalActivities: number;
  config: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
  isLoading?: boolean;
  change?: number;
}

export const PieChartCard = ({
  data,
  totalActivities,
  config,
  isLoading = false,
  change,
}: PieChartCardProps) => {
  if (isLoading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-0">
          <CardTitle>
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto aspect-square max-h-[200px] animate-pulse rounded-full bg-gray-200"></div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
        </CardFooter>
      </Card>
    );
  }

  const getChangeColor = () => {
    if (!change) return "text-muted-foreground";
    return change >= 0 ? "text-green-500" : "text-red-500";
  };

  const getChangeText = () => {
    if (!change) return "Tidak ada perubahan";
    const direction = change >= 0 ? "peningkatan" : "penurunan";
    return `${Math.abs(change).toFixed(1)}% ${direction} aktivitas bulan ini`;
  };

  return (
    <div className="h-full w-full md:flex-1">
      <Card className="flex h-fit flex-col md:h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-sm md:text-base">Aktivitas</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Berdasarkan jenis aktivitas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={config}
            className="mx-auto aspect-square max-h-[180px] md:max-h-[200px]"
          >
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                strokeWidth={0}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-xl font-bold md:text-2xl"
                          >
                            {totalActivities.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-muted-foreground text-xs"
                          >
                            Activities
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-1 text-xs md:gap-2 md:text-sm">
          <div
            className={`flex items-center gap-1 leading-none font-medium md:gap-2 ${getChangeColor()}`}
          >
            {getChangeText()}
            {change !== undefined &&
              (change >= 0 ? (
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
              ) : (
                <TrendingDown className="h-3 w-3 md:h-4 md:w-4" />
              ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
