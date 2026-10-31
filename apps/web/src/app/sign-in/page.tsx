import { Suspense } from 'react';
import { AuthShell } from '@/components/AuthShell';
import { SignInForm } from './SignInForm';

export const metadata = { title: 'Sign in' };
export default function SignIn() {
  return <AuthShell title="Welcome back" blurb="Sign in to book a pro or manage your jobs."><Suspense><SignInForm /></Suspense></AuthShell>;
}
