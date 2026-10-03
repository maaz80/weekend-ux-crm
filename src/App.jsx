import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import CrmDashboard from "./pages/CrmDashboard";
import { PermissionsProvider } from "./context/PermissionsContext";

export default function App() {
  return (
    <PermissionsProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <CrmDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PermissionsProvider>
  );
}
