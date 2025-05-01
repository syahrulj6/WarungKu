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
          <CardTitle>Activities Breakdown</CardTitle>
          <CardDescription>By Activity Type</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={config}
            className="mx-auto aspect-square max-h-[250px]"
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
                innerRadius={60}
                outerRadius={100}
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
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalActivities.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
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
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 leading-none font-medium">
            5.2% activities increased this month{" "}
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total activities by type
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
