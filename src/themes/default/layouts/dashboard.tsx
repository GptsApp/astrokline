import { ReactNode } from 'react';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden overflow-y-auto">
      {children}
    </div>
  );
}
