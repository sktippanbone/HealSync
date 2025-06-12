import AdminLayout from './AdminLayout';
import AdminUserTable from '../../components/usersList';

export default function AdminPanel() {
    return (
        <AdminLayout>
            <AdminUserTable  />
        </AdminLayout>
    );
  }