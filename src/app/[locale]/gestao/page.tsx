import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboardPage from '@/components/admin/AdminDashboardPage';

export const metadata = {
  title: 'Painel de Gestão',
};

export default function GestaoPage() {
  return (
    <AdminLayout>
      <AdminDashboardPage />
    </AdminLayout>
  );
}
