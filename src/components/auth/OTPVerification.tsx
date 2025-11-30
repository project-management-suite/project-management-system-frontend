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
      // Start 60-second cooldown
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-600 mb-2">
          We sent a 6-digit code to
        </p>
        <p className="text-center text-blue-600 font-semibold mb-8">{email}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-bold tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Code expires in 10 minutes
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-gray-600">Didn't receive the code?</p>

          {resendCooldown > 0 ? (
            <p className="text-sm text-gray-500">
              Resend available in {resendCooldown}s
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>
          )}

          <button
            onClick={onBack}
            className="flex items-center justify-center w-full text-gray-600 hover:text-gray-700 font-medium text-sm mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Registration
          </button>
        </div>
      </div>
    </div>
  );
};
