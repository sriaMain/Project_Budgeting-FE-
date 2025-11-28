import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import OtpInput from "../components/OtpInput";
import { useAppNavigation } from "../hooks/useAppNavigation";
import { useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import type { FormErrors } from "../types";

const VerificationScreen: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(41); // 41 seconds as per screenshot
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [errors, setErrors] = useState<FormErrors>({});
  const email = params.get("email") ?? "sri@gmail.com";
  const { goBack, goTo } = useAppNavigation();

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleConfirm = async () => {
    try {
      const response = await axiosInstance.post("/accounts/verify-otp/", {
        gmail: email,
        otp: otp,
      });
      if (response.status === 200) {
        const data = response.data;
        // store reset token if provided
        if (data?.reset_token) {
          localStorage.setItem("reset_token", data.reset_token);
        }
        goTo("/create-password");
      }
    } catch (err: any) {
          const newErrors: FormErrors = {};
    console.error("Login error:", err);
          // Helper to extract error data from various possible structures (Axios, etc)
          const getErrorData = (error: any) => {
            // Standard Axios Error structure (err.response.data.error)
            if (error?.response?.data?.error) return error.response.data.error;
            // Response object directly thrown (err.data.error)
            if (error?.data?.error) return error.data.error;
            return null;
          };
    
          const apiErrors = getErrorData(err);
    
          if (apiErrors) {
             const errorList = Array.isArray(apiErrors) ? apiErrors : [apiErrors];
             // Join all errors into a single string for the general error field
             // This ensures all errors are displayed at the top, regardless of content
             newErrors.general = errorList.join(', ');
          } else {
             // Fallback for standard Error objects or unhandled cases
             newErrors.general = err instanceof Error ? err.message : 'An unexpected error occurred';
          }
    
          setErrors(newErrors)
  };
  }
const handleResendOtp = async () => { 

    try {
      const response = await axiosInstance.post("/accounts/otp-request/", {
        gmail: email,
      });
      if (response.status === 200) {
        console.log("OTP resent successfully");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
    }
  }

  // Clear general error when user edits the OTP
  useEffect(() => {
    if (errors.general) setErrors((prev) => ({ ...prev, general: undefined }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleResend = () => {
    if (timeLeft === 0) {
      setTimeLeft(41);
      handleResendOtp();
    }
  };

  return (
    <div className="max-w-md w-full flex flex-col items-center text-center animate-fade-in">
      {/* Header Section */}
      <h1 className="text-[2rem] font-bold text-gray-900 mb-4 tracking-tight">
        Check Your email
      </h1>

      <p className="text-gray-500 text-lg leading-relaxed max-w-xs mx-auto mb-2">
        Please enter the four digit verification code we sent to
      </p>
      <p className="text-gray-900 font-bold text-lg mb-6">{email}</p>

      {/* General error alert (invalid/expired OTP etc.) */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center max-w-md mx-auto">
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
            ></path>
          </svg>
          <div>{errors.general}</div>
        </div>
      )}

      {/* OTP Input Section */}
      <div className="w-full flex justify-center">
        <OtpInput length={4} value={otp} onChange={setOtp} />
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={otp.length !== 4}
        className={`
          w-[280px] py-3.5 rounded-xl font-bold text-white text-lg transition-all duration-200 transform
          ${
            otp.length === 4
              ? "bg-[#1D4ED8] hover:bg-[#1E40AF] shadow-lg shadow-blue-900/20 cursor-pointer active:scale-[0.98]"
              : "bg-[#1D4ED8] opacity-90 cursor-not-allowed" // Keeping it blue but maybe slightly different interaction as per design often staying primary
          }
        `}
        // Note: In the image, the button is solid blue.
        // I'm assuming it stays blue but might not do anything if empty.
      >
        Confirm
      </button>

      {/* Resend Timer */}
      <div className="mt-6 text-gray-400 font-medium text-[15px]">
        <span>Didn't get the email? </span>
        <button
          onClick={handleResend}
          disabled={timeLeft > 0}
          className={`${
            timeLeft === 0
              ? "text-blue-700 cursor-pointer hover:underline"
              : "text-gray-400 cursor-default"
          }`}
        >
          {timeLeft > 0 ? `Resent in ${formatTime(timeLeft)}` : "Resend code"}
        </button>
      </div>

      {/* Back Button */}
      <button
        className="mt-8 flex items-center gap-2 text-gray-900 font-bold text-lg hover:text-gray-700 transition-colors group"
        onClick={goBack}
      >
        <ArrowLeft className="w-6 h-6 stroke-[3px] group-hover:-translate-x-1 transition-transform duration-200" />
        Back
      </button>
    </div>
  );
};

export default VerificationScreen;
