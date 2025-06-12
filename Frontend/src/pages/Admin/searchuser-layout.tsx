import AdminLayout from './AdminLayout';
import  PatientSearch from '../Admin/search-patient';

export default function Searchuser() {
    return (
        <AdminLayout>
            <PatientSearch  />
        </AdminLayout>
    );
  }