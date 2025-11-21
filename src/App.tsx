import React from "react";
import { LoginForm } from "./pages/LoginForm";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ForgotPasswordForm } from "./pages/ForgotPasswordForm";
import VerificationScreen from "./pages/VerificationScreen";
import CreatePasswordScreen from "./pages/CreatePasswordScreen";

const App: React.FC = () => {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-white p-4 sm:p-6 lg:p-8">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm />} />

          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path ="/verification" element={<VerificationScreen/>}/>
          <Route path="/create-password" element={<CreatePasswordScreen />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};

export default App;
