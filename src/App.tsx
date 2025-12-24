import React, { useEffect, useState } from "react";
import { LoginForm } from "./pages/LoginForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { ForgotPasswordForm } from "./pages/ForgotPasswordForm";
import VerificationScreen from "./pages/VerificationScreen";
import CreatePasswordScreen from "./pages/CreatePasswordScreen";
import DashboardScreen from "./pages/DashboardScreen";
import AdministrationScreen from "./pages/AdministrationScreen";

import ProjectsScreen from "./pages/ProjectsScreen";
import ProtectedRoute from "./auth/ProtectedRoute";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import TaskManagement from "./pages/TaskManagement";
import ContactsScreen from "./pages/ContactsScreen";
import PipelineScreen from "./pages/PipelineScreen";
import QuoteDetailsPage from "./pages/QuoteDetailsPage";
import AddQuotePage from "./pages/AddQuotePage";
import { initializeAuth } from "./auth/authThunk";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [userRole, setUserRole] = useState<"admin" | "user">("admin");
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    console.log("App mounted, initializing auth...");

    initializeAuth();
    console.log("Auth initialization dispatched.");
  }, []);


  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />
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

          {/* Protect Pipeline */}
          <Route
            path="/pipeline"
            element={
              <ProtectedRoute>
                <PipelineScreen
                  userRole={userRole}
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                />
              </ProtectedRoute>
            }
          />

          {/* Protect Projects */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsScreen
                  userRole={userRole}
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                />
              </ProtectedRoute>
            }
          />

          {/* Protect Quotes */}
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectDetailsPage
                  userRole={userRole}
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                />
              </ProtectedRoute>
            }
          />
          {/* Protect Quote Details */}
          <Route
            path="/pipeline/quote/:quoteNo"
            element={
              <ProtectedRoute>
                <QuoteDetailsPage
                  userRole={userRole}
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                />
              </ProtectedRoute>
            }
          />

          {/* Task Management */}
          <Route
            path="/task-management"
            element={
              <ProtectedRoute>
                <TaskManagement
                  userRole={userRole}
                  currentPage={currentPage}
                  onNavigate={handleNavigate}
                />
              </ProtectedRoute>
            }
          />

          {/* Protect Add Quote */}
          <Route
            path="/pipeline/add-quote"
            element={
              <ProtectedRoute>
                <AddQuotePage />
              </ProtectedRoute>
            }
          />

          {/* Edit Quote */}
          <Route
            path="/pipeline/edit-quote/:quoteId"
            element={
              <ProtectedRoute>
                <AddQuotePage />
              </ProtectedRoute>
            }
          />

          {/* Edit Project */}
          <Route
            path="/projects/edit/:projectId"
            element={
              <ProtectedRoute>
                <AddQuotePage />
              </ProtectedRoute>
            }
          />

          <Route path="/create-password" element={<CreatePasswordScreen />} />


        </Routes >
      </BrowserRouter >
    </main >
  );
};

export default App;
