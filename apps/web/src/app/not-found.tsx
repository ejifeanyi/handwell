import { ButtonLink } from '@/components/ui';
import { Icon } from '@/components/Icon';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-5 py-28 text-center">
      <span className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-sage text-pine"><Icon name="search" size={40} /></span>
      <h1 className="text-h1">We could not find that page</h1>
      <p className="text-lg text-ink-soft">The link may be old, or the pro may no longer be listed. Try searching for what you need.</p>
      <div className="flex gap-3"><ButtonLink href="/pros">Find a pro</ButtonLink><ButtonLink href="/" variant="secondary">Back to home</ButtonLink></div>
    </div>
  );
}
