import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { OrganizationList } from "./components/organizations/OrganizationList";
import { ClassList } from "./components/classes/ClassList";
import { UserList } from "./components/users/UserList";
import { RequestList } from "./components/requests/RequestList";
import { Dashboard } from "./components/dashboard/Dashboard";
import { AnalyticsDashboard } from "./components/dashboard/AnalyticsDashboard";
import { SettingsPage } from "./components/settings/SettingsPage";
import { LoginForm } from "./components/auth/LoginForm";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { useToast } from "./components/notifications/NotificationToast";

function AppContent() {
  const { user, login, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { ToastContainer } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "organizations":
        return <OrganizationList />;
      case "dashboard":
        return <Dashboard onNavigate={setCurrentPage} />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "classes":
        return <ClassList />;
      case "users":
        return <UserList currentUser={user} />;
      case "requests":
        return <RequestList />;
      case "settings":
        return <SettingsPage />;
      default:
        return <OrganizationList />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        <main className="flex-1 overflow-y-auto">
          {renderCurrentPage()}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
