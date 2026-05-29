export const API_BASE_URL = 'http://localhost:3000'

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  CSRF_TOKEN: 'csrf_token',
  CART: 'cart',
}

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  STATS_CATEGORIES: '/stats/categories',
  DASHBOARD: '/dashboard',
  PRODUCT_NEW: '/products/new',
  PRODUCT_EDIT: '/products/:id/edit',
  CSP_REPORT: '/csp-report',
}

export const MOCK_STORAGE_KEYS = {
  PRODUCTS: 'mock_products',
  CSP_REPORTS: 'csp_reports',
}