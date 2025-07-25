import { Bar, BarChart, CartesianGrid, XAxis, Tooltip } from "recharts";
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
import { useMediaQuery } from "~/hooks/useMediaQuery";

interface BarChartCardProps {
  data: { date: string; count: number }[];
  config: {
    [key: string]: {
      label: string;
      color: string;
    };
  };
  isLoading?: boolean;
  timePeriod?: string;
}

export const BarChartCard = ({
  data,
  config,
  isLoading = false,
  timePeriod,
}: BarChartCardProps) => {
  const isMd = useMediaQuery("(min-width: 768px)");
  const isLg = useMediaQuery("(min-width: 1024px)");

  if (timePeriod === "all-time") {
    timePeriod = "Semua waktu";
  }

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
          {timePeriod}
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full overflow-hidden">
        <ChartContainer config={config} className="h-32 w-full md:h-40 lg:h-52">
          <BarChart
            data={data}
            width={400}
            height={isMd ? (isLg ? 192 : 160) : 128}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            barCategoryGap={isLg ? 40 : isMd ? 24 : 12}
          >
            <CartesianGrid vertical={false} stroke="#eee" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                format(new Date(value), "d MMM", { locale: id })
              }
            />
            <Tooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" fill={"#4D55CC"} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-xs md:gap-2 md:text-sm">
        <div className="flex gap-1 leading-none font-medium md:gap-2">
          Aktivitas Anda selama {timePeriod} terakhir{" "}
          <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Menampilkan total aktivitas untuk {timePeriod} terakhir
        </div>
      </CardFooter>
    </Card>
  );
};
