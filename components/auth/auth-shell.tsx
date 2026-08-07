import { AuthLogo } from '@/components/auth/auth-logo';
import { AuthMiningPanel } from '@/components/auth/auth-mining-panel';
import { Card, CardContent } from '@/components/ui/card';

export interface AuthShellProps {
  children: React.ReactNode;
  miningImageAlt: string;
  miningPlaceholderLabel: string;
  homeLabel: string;
}

export function AuthShell({
  children,
  miningImageAlt,
  miningPlaceholderLabel,
  homeLabel,
}: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
        <div className="flex w-full max-w-[440px] flex-col items-center">
          <AuthLogo homeLabel={homeLabel} />
          <Card className="w-full">
            <CardContent className="p-8">{children}</CardContent>
          </Card>
        </div>
      </div>
      <AuthMiningPanel
        imageAlt={miningImageAlt}
        placeholderLabel={miningPlaceholderLabel}
      />
    </div>
  );
}
