/**
 * Hand-maintained row types for the Neon Postgres tables in `neon/schema.sql`.
 *
 * There is no generated client: application queries live in `src/lib/neon-data.ts`
 * and return plain rows. Keep these
 * shapes in sync when the Neon schema changes. Timestamps are ISO strings as
 * returned by the Neon HTTP driver; `numeric` columns are numbers.
 */

export type Role = 'student' | 'founder' | 'admin';
export type ProjectStatus = 'open' | 'in_progress' | 'review' | 'completed';
export type ApplicationStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected';
export type ShortlistStatus = 'requested' | 'contacted' | 'hired' | 'rejected';
export type ShortlistSource = 'admin' | 'founder';
export type OrderStatus = 'pending' | 'submitted' | 'confirmed' | 'rejected';
export type OrderPackage = 'basic' | 'full';

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  college: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  founder_id: string;
  student_id: string | null;
  budget: number | null;
  status: ProjectStatus;
  created_at: string;
  required_skills: string[];
  duration: string | null;
  budget_min: number | null;
  budget_max: number | null;
  work_mode: string;
  deadline: string | null;
}

export interface Application {
  id: string;
  student_id: string;
  project_id: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  changed_at: string;
  changed_by_ref: string | null;
}

export interface StudentProfile {
  id: string;
  full_name: string | null;
  college: string | null;
  course: string | null;
  year: '1st' | '2nd' | '3rd' | '4th' | 'Graduate' | null;
  skills: string[];
  bio: string | null;
  availability: 'weekdays' | 'weekends' | 'evenings' | 'full_time' | 'flexible' | null;
  cv_url: string | null;
  cv_path: string | null;
  created_at: string;
  updated_at: string;
  rank: number | null;
  verified: boolean;
  contact_email: string | null;
}

export interface Shortlist {
  id: string;
  founder_id: string;
  student_id: string;
  status: ShortlistStatus;
  created_at: string;
  project_id: string | null;
  source: ShortlistSource;
}

export interface ShortlistOrder {
  id: string;
  founder_id: string;
  project_id: string | null;
  package: OrderPackage;
  amount: number | null;
  status: OrderStatus;
  screenshot_path: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface Database {
  profiles: Profile;
  projects: Project;
  applications: Application;
  application_status_history: ApplicationStatusHistory;
  student_profiles: StudentProfile;
  shortlists: Shortlist;
  shortlist_orders: ShortlistOrder;
}
