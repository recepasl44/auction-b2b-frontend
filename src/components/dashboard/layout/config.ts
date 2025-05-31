import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

const adminItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'production', title: 'Production Requests', href: paths.productionRequests.list, icon: 'users' },
  { key: 'auctions', title: 'Auctions', href: paths.auctions.list, icon: 'plugs-connected' },
  { key: 'orders', title: 'Orders', href: paths.orders.list, icon: 'users' },
  { key: 'payments', title: 'Payments', href: paths.payments.create, icon: 'user' },
  { key: 'shipments', title: 'Logistics', href: paths.shipments.create, icon: 'user' },
  { key: 'reports', title: 'Reports', href: paths.reports.summary, icon: 'gear-six' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },

  { key: 'users', title: 'Users', href: '/users/list', icon: 'users' },
];
const customerItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'production', title: 'Production Request', href: paths.productionRequests.create, icon: 'users' },
  { key: 'auctions', title: 'Auctions', href: paths.auctions.list, icon: 'plugs-connected' },
  { key: 'orders', title: 'Orders', href: paths.orders.list, icon: 'users' },
  { key: 'profile', title: 'Profile', href: paths.dashboard.account, icon: 'user' },
];

const manufacturerItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'auctions', title: 'Auctions', href: paths.auctions.list, icon: 'plugs-connected' },
  { key: 'orders', title: 'Orders', href: paths.orders.list, icon: 'users' },
  { key: 'reports', title: 'Reports', href: paths.reports.summary, icon: 'gear-six' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
];

export function getNavItems(roleId?: number): NavItemConfig[] {
  switch (roleId) {
    case 1:
      return adminItems;
    case 2:
      return customerItems;
    case 3:
      return manufacturerItems;
    default:
      return adminItems;
  }
}