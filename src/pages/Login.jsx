import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { clearCrmToken, isCrmLoggedIn, setCrmToken } from "../utils/auth.js";
import { HiOutlineLockClosed, HiOutlineUser } from "react-icons/hi";

const CRM_API_URL = import.meta.env.VITE_CRM_API_URL || "http://localhost:5000/api/crm/leads";
// Derive base URL (e.g. "http://localhost:5000/api/crm")
const CRM_AUTH_URL = CRM_API_URL.replace(/\/leads\/?$/, "/auth/login");
const ADMIN_AUTH_URL = "http://localhost:5000/api/admin/login";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const logoUrl = "/logo.jpeg";

  if (isCrmLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearCrmToken();
    setError("");
    setLoading(true);

    try {
      let res = null;
      let data = null;

      // 1. Try CRM Backend auth endpoint first
      try {
        res = await fetch(CRM_AUTH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), password })
        });
        data = await res.json();
      } catch (err) {
        // Fallback to Admin backend if CRM backend endpoint is unreachable
        res = await fetch(ADMIN_AUTH_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), password })
        });
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Login failed.");
      }

      const token = data.token || "authenticated_crm_session";
      const user = data.user || { username: username.trim(), role: "Administrator" };

      setCrmToken(token, user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-official/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 rounded-full bg-official/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-8">
        {/* Brand / Logo */}
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <img
            src={logoUrl}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/apple-touch-icon.png";
            }}
            alt="Weekend UX Logo"
            className="h-16 w-auto max-w-50 object-contain rounded-2xl"
          />
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Weekend UX CRM
              </h1>
              <span className="bg-official/20 text-zinc-950 text-[10px] font-bold px-2 py-0.5 rounded-full border border-official/40">
                PRO
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Enter credentials to access lead management & pipeline
            </p>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-gray-200/80 p-8 rounded-3xl shadow-xl shadow-gray-200/40 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <HiOutlineUser className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-official/30 focus:border-official focus:bg-white transition-all duration-200"
                  placeholder="admin"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <HiOutlineLockClosed className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-official/30 focus:border-official focus:bg-white transition-all duration-200"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Error alert */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-official hover:bg-official/90 disabled:opacity-50 text-zinc-950 py-3 rounded-xl font-bold shadow-md hover:-translate-y-0.5 disabled:translate-y-0 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to CRM</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
