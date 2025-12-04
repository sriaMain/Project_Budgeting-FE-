import React, {  useState } from "react";
import { LoginForm } from "./pages/LoginForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ForgotPasswordForm } from "./pages/ForgotPasswordForm";
import VerificationScreen from "./pages/VerificationScreen";
import CreatePasswordScreen from "./pages/CreatePasswordScreen";
import DashboardScreen from "./pages/DashboardScreen";
import AdministrationScreen from "./pages/AdministrationScreen";

import ProtectedRoute from "./auth/ProtectedRoute";

import ContactsScreen from "./pages/ContactsScreen";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [userRole, setUserRole] = useState<"admin" | "user">("admin");
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };





  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white p-4 sm:p-6 lg:p-8">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />

          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/verification" element={<VerificationScreen />} />
              

          {/* Protect Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardScreen
                  userRole={userRole}
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                />
              </ProtectedRoute>
            }
          />

          {/* Protect Administration */}
          <Route
            path="/administration"
            element={
              <ProtectedRoute>
                <AdministrationScreen
                  userRole={userRole}
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/contacts" element={
            <ProtectedRoute>
              <ContactsScreen
             
              />
            </ProtectedRoute>
          } />
          <Route path="/create-password" element={<CreatePasswordScreen />} />
          
        
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default App;
