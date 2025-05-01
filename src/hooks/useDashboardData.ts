import { subDays, format } from "date-fns";
import { api } from "~/utils/api";
import { type ChartActivityConfig, chartActivityConfig } from "~/utils/type";

type ActivityCounts = Record<string, number>;

export const useWarungDashboardData = (warungId: string) => {
  // Fetch warung activities instead of user activities
  const { data: warungActivities } = api.warung.getWarungActivities.useQuery(
    { warungId },
    { enabled: !!warungId },
  );

  // Count activities by type
  const activityCounts = warungActivities?.reduce<ActivityCounts>(
    (acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    },
    {},
  );

  // Filter activities from last 7 days
  const last7DaysActivities = warungActivities?.filter((activity) => {
    const activityDate = new Date(activity.createdAt);
    const sevenDaysAgo = subDays(new Date(), 7);
    return activityDate >= sevenDaysAgo;
  });

  // Count activities by day
  const activityCountsByDay = last7DaysActivities?.reduce<
    Record<string, number>
  >((acc, activity) => {
    const activityDate = format(new Date(activity.createdAt), "yyyy-MM-dd");
    acc[activityDate] = (acc[activityDate] || 0) + 1;
    return acc;
  }, {});

  // Prepare chart data
  const chartData = Object.entries(activityCountsByDay || {}).map(
    ([date, count]) => ({
      date,
      count,
    }),
  );

  // Sort chart data by date
  const sortedChartData = chartData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Prepare pie chart data with colors
  const pieChartData = Object.entries(activityCounts || {}).map(
    ([activityType, count]) => ({
      name: activityType,
      value: count,
      fill:
        chartActivityConfig[activityType as keyof ChartActivityConfig]?.color ||
        "#000",
    }),
  );

  // Get last 7 activities of specific type
  const getLast7Activities = (activityType: string) => {
    return warungActivities
      ?.filter((activity) => activity.type === activityType)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 7);
  };

  // Get recent activities with related data
  const getRecentActivities = (limit = 10) => {
    return warungActivities
      ?.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  };

  return {
    activityCounts,
    sortedChartData,
    pieChartData,
    warungActivities,
    getLast7Activities,
    getRecentActivities,
    totalActivities: warungActivities?.length || 0,
    last7DaysCount: last7DaysActivities?.length || 0,
  };
};
