import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { OrganizationList } from "./components/organizations/OrganizationList";
import { ClassList } from "./components/classes/ClassList";
import { UserList } from "./components/users/UserList";
import { RequestList } from "./components/requests/RequestList";
import { Dashboard } from "./components/dashboard/Dashboard";
import { LoginForm } from "./components/auth/LoginForm";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function AppContent() {
  const { user, login, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");

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
        return <Dashboard />;
      case "classes":
        return <ClassList />;
      case "users":
        return <UserList currentUser={user} />;
      case "requests":
        return <RequestList />;
      case "settings":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-4">Settings</h2>
            <p className="text-muted-foreground">Application settings coming soon...</p>
          </div>
        );
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
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
