import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn } from 'lucide-react';

interface LoginProps {
  onToggleMode: () => void;
}

export const Login = ({ onToggleMode }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark app-dark flex items-center justify-center p-5">
      <div className="glass rounded-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="neo-icon p-3 rounded-lg">
            <LogIn className="w-8 h-8" style={{ color: "var(--brand)" }} />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-center opacity-70 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggleMode}
            className="nav-link font-medium"
            style={{ color: "var(--brand)" }}
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
};