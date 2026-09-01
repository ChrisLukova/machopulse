import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import AuthTerminal from "./components/AuthTerminal";
import Dashboard from "./components/Dashboard";
import WebsiteDetails from "./components/WebsiteDetails";
import { Toaster } from "sonner";

// Reusable Loading Screen Component
function FullScreenLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white font-mono space-y-3 bg-neutral-900">
      <div className="w-6 h-6 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs uppercase tracking-widest text-neutral-400">
        Initializing Session...
      </span>
    </div>
  );
}

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        theme="light"
        toastOptions={{
          style: {
            fontFamily: "monospace",
            borderRadius: "0px",
            border: "1px solid #EAEAEA",
            fontSize: "12px",
            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
          },
        }}
      />

      <div className="min-h-screen font-mono selection:bg-[#FF5500] selection:text-white">
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<AuthTerminal />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/websites/:id" element={<WebsiteDetails />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
}
