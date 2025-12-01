import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";

interface OTPVerificationProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResendOTP: () => Promise<void>;
  onBack: () => void;
}

export const OTPVerification = ({
  email,
  onVerify,
  onResendOTP,
  onBack,
}: OTPVerificationProps) => {
  const [otp, setOTP] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onVerify(otp);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError("");

    try {
      await onResendOTP();
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
 

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="neo-tile rounded-2xl p-8">
          {/* Icon container */}
          <div className="flex items-center justify-center mb-8">
            <div className="neo-icon w-20 h-20 rounded-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <Mail className="w-10 h-10 text-[#D35A5C]" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              Verify Your Email
            </h2>
            <p className="text-gray-400 mb-2">
              We sent a 6-digit code to
            </p>
            <p className="text-[#D35A5C] font-semibold text-lg">{email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-300 mb-3"
              >
                Enter 6-digit code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) =>
                  setOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="input w-full px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] rounded-xl"
                placeholder="000000"
                maxLength={6}
                required
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Code expires in 10 minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#D35A5C] text-white py-4 rounded-xl font-semibold hover:bg-[#bf4e50] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#D35A5C]/20 hover:shadow-xl hover:shadow-[#D35A5C]/30 hover:transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify Email"
              )}
            </button>
          </form>

          {/* Resend section */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-400">Didn't receive the code?</p>

            {resendCooldown > 0 ? (
              <div className="glass-soft px-4 py-2 rounded-lg inline-block">
                <p className="text-sm text-gray-300">
                  Resend available in{" "}
                  <span className="text-[#D35A5C] font-semibold">
                    {resendCooldown}s
                  </span>
                </p>
              </div>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-[#D35A5C] hover:text-[#bf4e50] font-medium text-sm transition-colors duration-300 hover:underline underline-offset-4"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            )}

            <button
              onClick={onBack}
              className="flex items-center justify-center w-full text-gray-400 hover:text-gray-300 font-medium text-sm mt-6 transition-colors duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Registration
            </button>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
};