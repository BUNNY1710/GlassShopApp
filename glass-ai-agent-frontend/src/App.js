import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import StockManager from "./pages/StockManager";
import StockDashboard from "./pages/StockDashboard";
import AiAssistant from "./pages/AiAssistant";
import CreateStaff from "./pages/CreateStaff";
import AuditLog from "./pages/AuditLog";
import ManageStaff from "./pages/ManageStaff";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Layout from "./layout/Layout";

const RequireAdmin = ({ children }) => {
  const role = localStorage.getItem("role");
  return role === "ROLE_ADMIN"
    ? children
    : <Navigate to="/dashboard" />;
};


function App() {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED WITH NAVBAR */}
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />

        <Route
          path="/manage-stock"
          element={<ProtectedRoute><StockManager /></ProtectedRoute>}
        />

        <Route
          path="/view-stock"
          element={<ProtectedRoute><StockDashboard /></ProtectedRoute>}
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
              <ManageStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-staff"
          element={<RequireAdmin><CreateStaff /></RequireAdmin>}
        />

        <Route
          path="/audit"
          element={<RequireAdmin><AuditLog /></RequireAdmin>}
        />

        <Route
          path="/ai"
          element={<RequireAdmin><AiAssistant /></RequireAdmin>}
        />
      </Route>

      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
