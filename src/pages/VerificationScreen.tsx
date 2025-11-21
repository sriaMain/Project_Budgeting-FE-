import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import OtpInput from "../components/OtpInput";
import { useAppNavigation } from "../hooks/useAppNavigation";
import axiosInstance from "../utils/axiosInstance";

const VerificationScreen: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(41); // 41 seconds as per screenshot
  const email = "admin@gmail.com";
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
        goTo("/create-password");
      }
const data = await response.data;
      console.log("OTP verification response data:", data);

const {detail,reset_token} = data;

localStorage.setItem("reset_token", reset_token);
    
    } catch (error: any) {
      console.error("OTP verification error:", error);
      alert("Invalid OTP. Please try again.");
    }
  };

  const handleResend = () => {
    if (timeLeft === 0) {
      setTimeLeft(41);
      alert("Code resent!");
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
