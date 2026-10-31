import { AuthShell } from '@/components/AuthShell';
import { SignUpForm } from './SignUpForm';

export const metadata = { title: 'Create your account' };
export default function SignUp() {
  return <AuthShell title="Create your account" blurb="It takes less than a minute." side="Join your neighborhood’s trusted pros"><SignUpForm /></AuthShell>;
}
