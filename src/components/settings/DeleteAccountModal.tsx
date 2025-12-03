import React, { useState } from "react";
import { X, AlertTriangle, Mail, KeyRound, Trash2 } from "lucide-react";
import { apiClient } from "../../lib/api";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onSuccess,
}: DeleteAccountModalProps) {
  const [step, setStep] = useState<"warning" | "otp">("warning");
  const [otp, setOtp] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleClose = () => {
    if (!loading) {
      setStep("warning");
      setOtp("");
      setConfirmed(false);
      setError("");
      setEmail("");
      onClose();
    }
  };

  const handleRequestDeletion = async () => {
    // Prevent duplicate requests
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const response = await apiClient.post("/auth/delete-account/request");
      setEmail(response.email);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send deletion OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendLoading) return;

    try {
      setResendLoading(true);
      setResendMessage("");
      setError("");

      await apiClient.post("/auth/delete-account/resend");
      setResendMessage("OTP resent to your email");
      setTimeout(() => setResendMessage(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleConfirmDeletion = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate requests
    if (loading) return;

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await apiClient.post("/auth/delete-account/confirm", { otp });

      // Account deleted successfully
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-700/30 bg-red-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-red-400">Delete Account</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "warning" && (
            <div className="space-y-4">
              {/* Warning Message */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 font-semibold mb-2">
                  ⚠️ Warning: This action is permanent!
                </p>
                <p className="text-gray-300 text-sm mb-3">
                  Deleting your account will permanently remove:
                </p>
                <ul className="text-gray-400 text-sm space-y-1 ml-4">
                  <li>• Your profile and personal information</li>
                  <li>• All projects you created</li>
                  <li>• All tasks and assignments</li>
                  <li>• All files you uploaded</li>
                  <li>• All work logs and reports</li>
                  <li>• Team memberships and notifications</li>
                </ul>
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-red-600 
                           focus:ring-2 focus:ring-red-500 focus:ring-offset-0"
                />
                <span className="text-gray-300 text-sm">
                  I understand that this action is{" "}
                  <strong className="text-red-400">
                    permanent and cannot be undone
                  </strong>
                  . All my data will be permanently deleted.
                </span>
              </label>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestDeletion}
                  disabled={!confirmed || loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <form onSubmit={handleConfirmDeletion} className="space-y-4">
              {/* OTP Info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-blue-400 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <strong>OTP sent to {email}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading || loading}
                    className="text-blue-400 text-xs hover:text-blue-300 underline disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {resendLoading ? "Sending..." : "Resend OTP"}
                  </button>
                </div>
                <p className="text-gray-400 text-sm">
                  Please check your email and enter the 6-digit code below to
                  confirm account deletion. The OTP will expire in 10 minutes.
                </p>
              </div>

              {resendMessage && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-400 text-sm">{resendMessage}</p>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setOtp(value);
                      setError("");
                    }}
                    placeholder="000000"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg
                             text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                             focus:ring-red-500 focus:border-transparent text-center text-lg 
                             tracking-widest font-mono"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Final Warning */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-xs text-center">
                  ⚠️ Confirming this OTP will{" "}
                  <strong>immediately and permanently delete</strong> your
                  account!
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("warning");
                    setOtp("");
                    setError("");
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={otp.length !== 6 || loading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Confirm & Delete
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
