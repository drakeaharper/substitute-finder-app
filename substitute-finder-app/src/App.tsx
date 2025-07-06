import { useState } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { OrganizationList } from "./components/organizations/OrganizationList";

function App() {
  const [currentPage, setCurrentPage] = useState("organizations");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "organizations":
        return <OrganizationList />;
      case "dashboard":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
            <p className="text-muted-foreground">Welcome to the Substitute Finder Admin Panel</p>
          </div>
        );
      case "classes":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-4">Classes</h2>
            <p className="text-muted-foreground">Class management coming soon...</p>
          </div>
        );
      case "users":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-4">Users</h2>
            <p className="text-muted-foreground">User management coming soon...</p>
          </div>
        );
      case "requests":
        return (
          <div className="p-6">
            <h2 className="text-3xl font-bold mb-4">Substitute Requests</h2>
            <p className="text-muted-foreground">Request management coming soon...</p>
          </div>
        );
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
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;
