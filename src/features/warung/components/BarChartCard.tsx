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
      <CardHeader className="pb-2">
        <CardTitle className="text-sm md:text-base">Your activities</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Last 7 days
        </CardDescription>
      </CardHeader>
      <CardContent className="h-32 w-full overflow-hidden md:h-40 lg:h-48">
        <ResponsiveContainer width="100%" height="100%">
          <ChartContainer config={config}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <CartesianGrid vertical={false} stroke="#eee" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => format(new Date(value), "MMM d")}
                tick={{ fill: "#666", fontSize: 10 }}
              />
              <Tooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={false}
              />
              <Bar dataKey="count" fill={"#4D55CC"} radius={4} barSize={20} />
            </BarChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-xs md:gap-2 md:text-sm">
        <div className="flex gap-1 leading-none font-medium md:gap-2">
          Your activities over the last 7 days{" "}
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total activities for the last 7 days
        </div>
      </CardFooter>
    </Card>
  );
};
