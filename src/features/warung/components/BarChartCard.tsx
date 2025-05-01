import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ChartContainer, ChartTooltipContent } from "~/components/ui/chart";

interface BarChartCardProps {
  data: { date: string; count: number }[];
  config: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
}

export const BarChartCard = ({ data, config }: BarChartCardProps) => {
  return (
    <Card className="flex w-full flex-col justify-center">
      <CardHeader>
        <CardTitle>Your activities</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="h-48 w-full md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ChartContainer config={config}>
            <BarChart data={data}>
              <CartesianGrid vertical={false} stroke="#eee" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => format(new Date(value), "MMM d")}
                tick={{ fill: "#666", fontSize: 12 }}
              />
              <Tooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={false}
              />
              <Bar dataKey="count" fill={"#4D55CC"} radius={4} />
            </BarChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Your activities over the last 7 days{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total activities for the last 7 days
        </div>
      </CardFooter>
    </Card>
  );
};
