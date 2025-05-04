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
import { id } from "date-fns/locale";
import { ChartContainer, ChartTooltipContent } from "~/components/ui/chart";
import { Skeleton } from "~/components/ui/skeleton";

interface BarChartCardProps {
  data: { date: string; count: number }[];
  config: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
  isLoading?: boolean;
}

export const BarChartCard = ({
  data,
  config,
  isLoading = false,
}: BarChartCardProps) => {
  if (isLoading) {
    return (
      <Card className="flex w-full flex-col">
        <CardHeader className="pb-2">
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-24" />
          </CardDescription>
        </CardHeader>
        <CardContent className="h-32 w-full overflow-hidden md:h-40 lg:h-48">
          <Skeleton className="h-full w-full" />
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex w-full flex-col justify-center">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm md:text-base">Aktivitas Anda</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          7 Hari Terakhir
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
                tickFormatter={(value) =>
                  format(new Date(value), "d MMM", { locale: id })
                }
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
          Aktivitas Anda selama 7 hari terakhir{" "}
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Menampilkan total aktivitas untuk 7 hari terakhir
        </div>
      </CardFooter>
    </Card>
  );
};
