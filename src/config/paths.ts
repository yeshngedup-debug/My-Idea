/**
 * Route paths used by the app: marketing pages, auth, workspaces and API
 * routes. Keeping them here prevents the login redirects, proxy checks and
 * links from drifting apart. Route groups such as `(app)` are not part of the
 * URL.
 */

export const PATHS = {
  home: '/public',
  root: '/',
  howItWorks: '/how-it-works',
  forStudents: '/for-students',
  forFounders: '/for-founders',
  about: '/about',
  faq: '/faq',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  authCallback: '/auth/callback',
  student: '/student',
  studentProfile: '/student/profile',
  studentApplications: '/student/applications',
  studentProjects: '/student/projects',
  founder: '/founder',
  founderProfile: '/founder/profile',
  founderProjects: '/founder/projects',
  postProject: '/founder/projects/post',
  browseProjects: '/founder/browse-projects',
  browseStudents: '/founder/browse-students',
  shortlists: '/founder/shortlists',
  agreement: '/founder/shortlists/agreement',
  admin: '/admin',
  adminPayments: '/admin/payments',
  adminProjects: '/admin/projects',
  adminStudents: '/admin/students',
  contextData: '/api/context-data',
  health: '/api/health',
  neonStatus: '/api/neon',
  realtimeOrders: '/api/realtime/orders',
} as const;

export type Role = 'student' | 'founder' | 'admin';

/** Landing route for each role; the proxy uses the same mapping. */
export const ROLE_HOME: Record<Role, string> = {
  student: PATHS.student,
  founder: PATHS.founder,
  admin: PATHS.admin,
};

export function dashboardPath(role: Role | null | undefined): string {
  return role ? ROLE_HOME[role] : PATHS.home;
}

export const studentProjectPath = (id: string) => `${PATHS.studentProjects}/${id}`;
export const founderProjectPath = (id: string) => `${PATHS.founderProjects}/${id}`;
export const founderStudentPath = (id: string) => `/founder/students/${id}`;
export const cvDownloadPath = (studentId: string) => `/api/cv/${studentId}`;
