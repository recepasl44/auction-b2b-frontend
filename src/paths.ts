export const paths = {
  home: '/',
auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/verifyEmail',
  },  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
  },
  productionRequests: {
    create: '/productionRequests/create',
    mine: '/productionRequests/mine',
    list: '/productionRequests/list',
  },
  auctions: {
    list: '/auctions/list',
    create: '/auctions/create',

  },
  orders: {
    list: '/orders/list',
  },
  payments: {
    create: '/payments/create',
  },
  shipments: {
    create: '/shipments/create',
  },
  reports: {
    summary: '/reports/summary',
  },
  users: {
    list: '/users/list',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
