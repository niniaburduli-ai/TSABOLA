export type DashboardMetric = {
  title: string;
  value: string;
  description: string;
  icon: 'activity' | 'clock' | 'trending-up' | 'users';
};

export const DASHBOARD_METRICS: DashboardMetric[] = [
  {
    title: 'Total Users',
    value: '1,234',
    description: '+12% from last month',
    icon: 'users',
  },
  {
    title: 'Active Sessions',
    value: '56',
    description: 'Currently active',
    icon: 'activity',
  },
  {
    title: 'Growth Rate',
    value: '8.2%',
    description: 'Month over month',
    icon: 'trending-up',
  },
  {
    title: 'Avg. Session Time',
    value: '24m',
    description: 'Per active session',
    icon: 'clock',
  },
];
