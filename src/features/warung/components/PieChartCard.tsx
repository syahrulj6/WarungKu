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
import { TrendingUp } from "lucide-react";

interface PieChartCardProps {
  data: { name: string; value: number; fill: string }[];
  totalActivities: number;
  config: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
}

export const PieChartCard = ({
  data,
  totalActivities,
  config,
}: PieChartCardProps) => {
  return (
    <div className="h-full w-full md:flex-1">
      <Card className="flex h-fit flex-col md:h-full">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-sm md:text-base">
            Activities Breakdown
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            By Activity Type
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
          <div className="flex items-center gap-1 leading-none font-medium md:gap-2">
            5.2% activities increased this month{" "}
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total activities by type
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
