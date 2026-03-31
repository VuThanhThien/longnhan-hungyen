import DashboardPage from '@/app/(dashboard)/page';
import DashboardLayout from '@/app/(dashboard)/layout';

export default function HomePage() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}
