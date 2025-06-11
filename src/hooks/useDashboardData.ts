import {
  subDays,
  subYears,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns";
import { useMemo } from "react";
import { api } from "~/utils/api";
import { type ChartActivityConfig, chartActivityConfig } from "~/utils/type";

type ActivityCounts = Record<string, number>;
type TimePeriod = "7-hari" | "30-hari" | "1-tahun";

export const useWarungDashboardData = (
  warungId: string,
  timePeriod: TimePeriod = "7-hari",
) => {
  // Memoize date ranges to prevent infinite loops
  const dateRanges = useMemo(() => {
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
      default:
        return {
          startDate: subDays(now, 7),
          endDate: now,
          previousStartDate: subDays(now, 14),
          previousEndDate: subDays(now, 7),
        };
    }
  }, [timePeriod]); // Only recalculate when timePeriod changes

  const { startDate, endDate, previousStartDate, previousEndDate } = dateRanges;

  // Fetch warung activities with date filtering
  const { data: warungActivities } = api.warung.getWarungActivities.useQuery(
    {
      warungId,
      startDate,
      endDate,
    },
    {
      enabled: !!warungId && !!startDate && !!endDate,
    },
  );

  // Fetch previous period activities for comparison
  const { data: previousWarungActivities } =
    api.warung.getWarungActivities.useQuery(
      {
        warungId,
        startDate: previousStartDate,
        endDate: previousEndDate,
      },
      {
        enabled: !!warungId && !!previousStartDate && !!previousEndDate,
      },
    );

  // Fetch metrics with date filtering
  const { data: metrics } = api.sale.getMetrics.useQuery(
    {
      warungId,
      startDate,
      endDate,
    },
    {
      enabled: !!warungId && !!startDate && !!endDate,
    },
  );

  // Fetch previous period metrics for comparison
  const { data: previousMetrics } = api.sale.getMetrics.useQuery(
    {
      warungId,
      startDate: previousStartDate,
      endDate: previousEndDate,
    },
    {
      enabled: !!warungId && !!previousStartDate && !!previousEndDate,
    },
  );

  // Memoize activity counts to prevent unnecessary recalculations
  const activityCounts = useMemo(() => {
    return (
      warungActivities?.reduce<ActivityCounts>((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1;
        return acc;
      }, {}) || {}
    );
  }, [warungActivities]);

  // Memoize chart data preparation
  const chartData = useMemo(() => {
    if (!warungActivities) return [];

    if (timePeriod === "1-tahun") {
      // Monthly data for yearly period
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      const monthlyCounts = months.reduce<Record<string, number>>(
        (acc, month) => {
          const monthKey = format(month, "yyyy-MM");
          acc[monthKey] = 0;
          return acc;
        },
        {},
      );

      warungActivities.forEach((activity) => {
        const monthKey = format(new Date(activity.createdAt), "yyyy-MM");
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
      });

      return Object.entries(monthlyCounts).map(([month, count]) => ({
        date: format(new Date(month), "MMM yyyy"),
        count,
      }));
    } else {
      // Daily data for 7 and 30 day periods
      const days = eachDayOfInterval({ start: startDate, end: endDate });
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
    }
  }, [warungActivities, startDate, endDate, timePeriod]);

  // Sort chart data by date (memoized)
  const sortedChartData = useMemo(() => {
    return chartData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [chartData]);

  // Prepare pie chart data with colors (memoized)
  const pieChartData = useMemo(() => {
    return Object.entries(activityCounts).map(([activityType, count]) => ({
      name: activityType,
      value: count,
      fill:
        chartActivityConfig[activityType as keyof ChartActivityConfig]?.color ||
        "#000",
    }));
  }, [activityCounts]);

  // Calculate percentage changes (memoized)
  const calculateChange = useMemo(() => {
    return (current: number, previous: number) => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return ((current - previous) / previous) * 100;
    };
  }, []);

  // Memoize calculated values
  const calculatedMetrics = useMemo(() => {
    return {
      revenue: {
        current: metrics?.revenue || 0,
        previous: previousMetrics?.revenue || 0,
        change: calculateChange(
          metrics?.revenue || 0,
          previousMetrics?.revenue || 0,
        ),
      },
      orders: {
        current: metrics?.orders || 0,
        previous: previousMetrics?.orders || 0,
        change: calculateChange(
          metrics?.orders || 0,
          previousMetrics?.orders || 0,
        ),
      },
      customers: {
        current: metrics?.customers || 0,
        previous: previousMetrics?.customers || 0,
        change: calculateChange(
          metrics?.customers || 0,
          previousMetrics?.customers || 0,
        ),
      },
    };
  }, [metrics, previousMetrics, calculateChange]);

  return {
    activityCounts,
    sortedChartData,
    pieChartData,
    warungActivities,
    totalActivities: warungActivities?.length || 0,
    previousTotalActivities: previousWarungActivities?.length || 0,
    activitiesChange: calculateChange(
      warungActivities?.length || 0,
      previousWarungActivities?.length || 0,
    ),
    ...calculatedMetrics,
    lowStock: metrics?.lowStock || 0,
    timePeriod,
  };
};
