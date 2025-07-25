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
export type TimePeriod = "all-time" | "30-hari" | "1-tahun";

export const useWarungDashboardData = (
  warungId: string,
  timePeriod: TimePeriod = "all-time",
) => {
  // Memoize date ranges to prevent infinite loops
  const dateRanges = useMemo(() => {
    const now = new Date();

    switch (timePeriod) {
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
          startDate: undefined, // No start date for all-time
          endDate: now,
          previousStartDate: undefined, // No previous period for all-time
          previousEndDate: undefined,
        };
    }
  }, [timePeriod]);

  const { startDate, endDate, previousStartDate, previousEndDate } = dateRanges;

  // Fetch warung activities
  const { data: warungActivities } = api.warung.getWarungActivities.useQuery(
    {
      warungId,
      ...(timePeriod !== "all-time" && { startDate }), // Only include startDate if not all-time
      endDate,
    },
    {
      enabled: !!warungId && !!endDate,
    },
  );

  // Fetch previous period activities (not for all-time)
  const { data: previousWarungActivities } =
    api.warung.getWarungActivities.useQuery(
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
          timePeriod !== "all-time",
      },
    );

  // Fetch metrics
  const { data: metrics } = api.sale.getMetrics.useQuery(
    {
      warungId,
      ...(timePeriod !== "all-time" && { startDate }), // Only include startDate if not all-time
      endDate,
    },
    {
      enabled: !!warungId && !!endDate,
    },
  );

  // Fetch previous period metrics (not for all-time)
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
        timePeriod !== "all-time",
    },
  );

  // Memoize activity counts
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
    if (!warungActivities || !endDate) return [];

    // For all-time period, use the first activity date or 1 year ago as fallback
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
      // For yearly and all-time periods, show monthly data
      const months = eachMonthOfInterval({
        start: effectiveStartDate,
        end: endDate,
      });

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
      // For 30-day period, show daily data
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
    }
  }, [warungActivities, startDate, endDate, timePeriod]);
  // Sort chart data by date
  const sortedChartData = useMemo(() => {
    return chartData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [chartData]);

  // Prepare pie chart data with colors
  const pieChartData = useMemo(() => {
    return Object.entries(activityCounts).map(([activityType, count]) => ({
      name: activityType,
      value: count,
      fill:
        chartActivityConfig[activityType as keyof ChartActivityConfig]?.color ||
        "#000",
    }));
  }, [activityCounts]);

  // Calculate percentage changes
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
        previous: timePeriod === "all-time" ? 0 : previousMetrics?.revenue || 0,
        change:
          timePeriod === "all-time"
            ? 0
            : calculateChange(
                metrics?.revenue || 0,
                previousMetrics?.revenue || 0,
              ),
      },
      orders: {
        current: metrics?.orders || 0,
        previous: timePeriod === "all-time" ? 0 : previousMetrics?.orders || 0,
        change:
          timePeriod === "all-time"
            ? 0
            : calculateChange(
                metrics?.orders || 0,
                previousMetrics?.orders || 0,
              ),
      },
      customers: {
        current: metrics?.customers || 0,
        previous:
          timePeriod === "all-time" ? 0 : previousMetrics?.customers || 0,
        change:
          timePeriod === "all-time"
            ? 0
            : calculateChange(
                metrics?.customers || 0,
                previousMetrics?.customers || 0,
              ),
      },
    };
  }, [metrics, previousMetrics, calculateChange, timePeriod]);

  return {
    activityCounts,
    sortedChartData,
    pieChartData,
    warungActivities,
    totalActivities: warungActivities?.length || 0,
    previousTotalActivities:
      timePeriod === "all-time" ? 0 : previousWarungActivities?.length || 0,
    activitiesChange:
      timePeriod === "all-time"
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
