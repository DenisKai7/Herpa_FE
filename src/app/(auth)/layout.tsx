import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In — MedBot AI',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {children}
    </div>
  );
}
