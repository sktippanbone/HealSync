import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { AuthProvider } from './hooks/AuthContext';
import ProtectedRoute from './components/protectedRoute';
import NotFound from "./components/404.tsx";
import  { Suspense, lazy } from 'react';


const LoginPage = lazy(() => import('./pages/Authentication/LoginPage'));
const SignUp = lazy(() => import('./pages/Authentication/SignUp'));
const AdminDashboard = lazy(() => import("./pages/Admin/adminDashboard"));
// const AdminPanel = lazy(() => import("./pages/Admin/LiveUsers"));
const Searchuser = lazy(() => import("./pages/Admin/searchuser-layout.tsx"));
const Patient_Details = lazy(() => import("./pages/Admin/allpatientLayout.tsx"));
const AddNewPatient = lazy(() => import('./pages/Admin/adduser-layout.tsx'));
const NewPrescip = lazy(() => import('./pages/Admin/NewPrescriptionlaypout.tsx'));

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <div className="fixed right-4 z-50 p-2 top-[6px]">
            <ModeToggle />
          </div>
          <Suspense fallback={ <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 dark:border-neutral-100 border-stone-950"></div>
      </div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/addnewuser" element={<ProtectedRoute><AddNewPatient /></ProtectedRoute>} />
              <Route path="/page-not-found" element={<NotFound />} />
              <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              {/* <Route  path="/manage-users" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} /> */}
              <Route path="/Search-User" element={<ProtectedRoute><Searchuser /></ProtectedRoute>} />
              <Route path="/all-patient-details/:aadhaar" element={<ProtectedRoute><Patient_Details /></ProtectedRoute>} />
              <Route path="/new-prescription/:aadhaar" element={<ProtectedRoute><NewPrescip /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
