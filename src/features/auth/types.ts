/**
 * Public types for the auth feature, derived from the real action signatures
 * and the Neon role mirror used at login/signup.
 */
import type {
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  signup,
} from './actions';

/** The three roles the app actually routes on. Sourced from the Neon mirror. */
export type { Role } from '@/lib/neon-data';

export type LoginAction = typeof login;
export type SignupAction = typeof signup;
export type LogoutAction = typeof logout;
export type RequestPasswordResetAction = typeof requestPasswordReset;
export type ResetPasswordAction = typeof resetPassword;

export type AuthAction =
  | LoginAction
  | SignupAction
  | LogoutAction
  | RequestPasswordResetAction
  | ResetPasswordAction;

/** Shape shared by every FormData-based auth action (`logout` takes none). */
export type AuthFormAction = (formData: FormData) => Promise<void>;

export type AuthFieldName =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'password'
  | 'confirmPassword';

export type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;
