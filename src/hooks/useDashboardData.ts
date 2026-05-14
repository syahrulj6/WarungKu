import {
  subDays,
  subYears,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { api } from "~/utils/api";
import { type ChartActivityConfig, chartActivityConfig } from "~/utils/type";

type ActivityCounts = Record<string, number>;
export type TimePeriod = "7-hari" | "30-hari" | "1-tahun" | "all-time";

export const useKasirDashboardData = (
  warungId: string,
  timePeriod: TimePeriod = "30-hari",
  dateRange?: DateRange,
) => {
  const hasCustomDateFilter = !!dateRange?.from;

  const dateRanges = useMemo(() => {
    if (hasCustomDateFilter && dateRange?.from) {
      const selectedFrom = startOfDay(dateRange.from);
      const selectedTo = endOfDay(dateRange.to ?? dateRange.from);

      return {
        startDate: selectedFrom,
        endDate: selectedTo,
        previousStartDate: undefined,
        previousEndDate: undefined,
      };
    }

    const now = new Date();

    switch (timePeriod) {
      case "7-hari":
        return {
          startDate: subDays(now, 7),
          endDate: now,
          previousStartDate: subDays(now, 14),
          previousEndDate: subDays(now, 7),
        };
      case "30-hari":
        return {
          startDate: subDays(now, 30),
          endDate: now,
          previousStartDate: subDays(now, 60),
          previousEndDate: subDays(now, 30),
        };
      case "1-tahun":
        return {
          startDate: subYears(now, 1),
          endDate: now,
          previousStartDate: subYears(now, 2),
          previousEndDate: subYears(now, 1),
        };
      case "all-time":
      default:
        return {
          startDate: undefined,
          endDate: now,
          previousStartDate: undefined,
          previousEndDate: undefined,
        };
    }
  }, [timePeriod, hasCustomDateFilter, dateRange?.from, dateRange?.to]);

  const { startDate, endDate, previousStartDate, previousEndDate } = dateRanges;

  const { data: warungActivities } = api.kasir.getKasirActivities.useQuery(
    {
      warungId,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
    {
      enabled: !!warungId && !!endDate,
    },
  );

  const { data: previousWarungActivities } = api.kasir.getKasirActivities.useQuery(
    {
      warungId,
      startDate: previousStartDate,
      endDate: previousEndDate,
    },
    {
      enabled:
        !!warungId &&
        !!previousStartDate &&
        !!previousEndDate &&
        timePeriod !== "all-time" &&
        !hasCustomDateFilter,
    },
  );

  const { data: metrics } = api.sale.getMetrics.useQuery(
    {
      warungId,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
    {
      enabled: !!warungId && !!endDate,
    },
  );

  const { data: previousMetrics } = api.sale.getMetrics.useQuery(
    {
      warungId,
      startDate: previousStartDate,
      endDate: previousEndDate,
    },
    {
      enabled:
        !!warungId &&
        !!previousStartDate &&
        !!previousEndDate &&
        timePeriod !== "all-time" &&
        !hasCustomDateFilter,
    },
  );

  const activityCounts = useMemo(() => {
    return (
      warungActivities?.reduce<ActivityCounts>((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {}) || {}
    );
  }, [warungActivities]);

  const chartData = useMemo(() => {
    if (!warungActivities || !endDate) return [];

    const effectiveStartDate =
      timePeriod === "all-time"
        ? warungActivities.length > 0
          ? new Date(
              Math.min(
                ...warungActivities.map((a) => new Date(a.createdAt).getTime()),
              ),
            )
          : subYears(new Date(), 1)
        : startDate;

    if (!effectiveStartDate) return [];

    if (timePeriod === "1-tahun" || timePeriod === "all-time") {
      const months = eachMonthOfInterval({
        start: effectiveStartDate,
        end: endDate,
      });

      const monthlyCounts = months.reduce<Record<string, number>>((acc, month) => {
        const monthKey = format(month, "yyyy-MM");
        acc[monthKey] = 0;
        return acc;
      }, {});

      warungActivities.forEach((activity) => {
        const monthKey = format(new Date(activity.createdAt), "yyyy-MM");
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
      });

      return Object.entries(monthlyCounts).map(([month, count]) => ({
        date: format(new Date(month), "MMM yyyy"),
        count,
      }));
    }

    const days = eachDayOfInterval({
      start: effectiveStartDate,
      end: endDate,
    });

    const dailyCounts = days.reduce<Record<string, number>>((acc, day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      acc[dayKey] = 0;
      return acc;
    }, {});

    warungActivities.forEach((activity) => {
      const dayKey = format(new Date(activity.createdAt), "yyyy-MM-dd");
      dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;
    });

    return Object.entries(dailyCounts).map(([day, count]) => ({
      date: format(new Date(day), "MMM dd"),
      count,
    }));
  }, [warungActivities, startDate, endDate, timePeriod]);

  const sortedChartData = useMemo(() => {
    return chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [chartData]);

  const pieChartData = useMemo(() => {
    return Object.entries(activityCounts).map(([activityType, count]) => ({
      name: activityType,
      value: count,
      fill:
        chartActivityConfig[activityType as keyof ChartActivityConfig]?.color ||
        "#000",
    }));
  }, [activityCounts]);

  const calculateChange = useMemo(() => {
    return (current: number, previous: number) => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return ((current - previous) / previous) * 100;
    };
  }, []);

  const shouldZeroComparison = timePeriod === "all-time" || hasCustomDateFilter;

  const calculatedMetrics = useMemo(() => {
    return {
      revenue: {
        current: metrics?.revenue || 0,
        previous: shouldZeroComparison ? 0 : (previousMetrics?.revenue || 0),
        change: shouldZeroComparison
          ? 0
          : calculateChange(metrics?.revenue || 0, previousMetrics?.revenue || 0),
      },
      grossSales: {
        current: metrics?.grossSales || 0,
        previous: shouldZeroComparison ? 0 : (previousMetrics?.grossSales || 0),
        change: shouldZeroComparison
          ? 0
          : calculateChange(metrics?.grossSales || 0, previousMetrics?.grossSales || 0),
      },
      cogs: {
        current: metrics?.cogs || 0,
        previous: shouldZeroComparison ? 0 : (previousMetrics?.cogs || 0),
        change: shouldZeroComparison
          ? 0
          : calculateChange(metrics?.cogs || 0, previousMetrics?.cogs || 0),
      },
      unpaidOrders: {
        current: metrics?.unpaidOrders || 0,
        previous: shouldZeroComparison ? 0 : (previousMetrics?.unpaidOrders || 0),
        change: shouldZeroComparison
          ? 0
          : calculateChange(metrics?.unpaidOrders || 0, previousMetrics?.unpaidOrders || 0),
      },
      unpaidAmount: {
        current: metrics?.unpaidAmount || 0,
        previous: shouldZeroComparison ? 0 : (previousMetrics?.unpaidAmount || 0),
        change: shouldZeroComparison
          ? 0
          : calculateChange(metrics?.unpaidAmount || 0, previousMetrics?.unpaidAmount || 0),
      },
      averageOrderValue: {
        current: metrics?.averageOrderValue || 0,
        previous: shouldZeroComparison ? 0 : (previousMetrics?.averageOrderValue || 0),
        change: shouldZeroComparison
          ? 0
          : calculateChange(
              metrics?.averageOrderValue || 0,
              previousMetrics?.averageOrderValue || 0,
            ),
      },
      orders: {
        current: metrics?.orders || 0,
        previous: shouldZeroComparison ? 0 : (previousMetrics?.orders || 0),
        change: shouldZeroComparison
          ? 0
          : calculateChange(metrics?.orders || 0, previousMetrics?.orders || 0),
      },
      customers: {
        current: metrics?.customers || 0,
        previous: shouldZeroComparison ? 0 : (previousMetrics?.customers || 0),
        change: shouldZeroComparison
          ? 0
          : calculateChange(metrics?.customers || 0, previousMetrics?.customers || 0),
      },
    };
  }, [metrics, previousMetrics, calculateChange, shouldZeroComparison]);

  return {
    activityCounts,
    sortedChartData,
    pieChartData,
    warungActivities,
    totalActivities: warungActivities?.length || 0,
    previousTotalActivities: shouldZeroComparison ? 0 : previousWarungActivities?.length || 0,
    activitiesChange: shouldZeroComparison
      ? 0
      : calculateChange(
          warungActivities?.length || 0,
          previousWarungActivities?.length || 0,
        ),
    ...calculatedMetrics,
    lowStock: metrics?.lowStock || 0,
    timePeriod,
  };
};

