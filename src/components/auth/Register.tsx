import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { UserPlus } from "lucide-react";
import { OTPVerification } from "./OTPVerification";
import { apiClient } from "../../lib/api";

type UserRole = "ADMIN" | "MANAGER" | "DEVELOPER";

interface RegisterProps {
  onToggleMode: () => void;
}

export const Register = ({ onToggleMode }: RegisterProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("DEVELOPER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");
  const { signUp, setUserFromOTP } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Register user and send OTP
      await apiClient.register({ username, email, password, role });
      setRegistrationEmail(email);
      setShowOTPVerification(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp: string) => {
    const response = await apiClient.verifyOTP({
      email: registrationEmail,
      otp,
    });

    // Use the auth context function to properly set user state
    setUserFromOTP(response.token, response.user);

    // User is now logged in automatically - the app will redirect to dashboard
    // No need to show success screen since they're logged in
  };

  const handleResendOTP = async () => {
    await apiClient.resendOTP({ email: registrationEmail });
  };

  const handleBackToRegistration = () => {
    setShowOTPVerification(false);
    setRegistrationEmail("");
  };

  if (showOTPVerification) {
    return (
      <OTPVerification
        email={registrationEmail}
        onVerify={handleOTPVerify}
        onResendOTP={handleResendOTP}
        onBack={handleBackToRegistration}
      />
    );
  }

  if (success) {
    return (
      <div className="min-h-screen app-light dark:app-dark flex items-center justify-center p-5">
        <div className="glass rounded-2xl w-full max-w-md p-8">
          <div className="text-center">
            <div className="neo-icon p-4 rounded-full inline-block mb-5">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="var(--brand)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Email Verified Successfully!
            </h2>
            <p className="opacity-70 mb-6">
              Your account has been created and verified. You can now sign in.
            </p>
            <button
              onClick={onToggleMode}
              className="btn-primary px-6 py-2"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-light dark:app-dark flex items-center justify-center p-5">
      <div className="glass rounded-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="neo-icon p-3 rounded-lg">
            <UserPlus
              className="w-8 h-8"
              style={{ color: "var(--brand)" }}
            />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-2">
          Create Account
        </h2>
        <p className="text-center opacity-70 mb-8">
          Enter your details to create an account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="neo-tile border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-black/10  bg-white  focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-black/10  bg-white  focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-black/10  bg-white  focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
              required
              minLength={6}
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium mb-2"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2 rounded-lg border border-black/10  bg-white  focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent"
            >
              <option value="DEVELOPER">Developer</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full border rounded-md  btn-primary justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggleMode}
            className="nav-link font-medium"
            style={{ color: "var(--brand)" }}
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
