import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { clearCrmToken, isCrmLoggedIn, setCrmToken } from "../utils/auth.js";
import {
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlinePhone
} from "react-icons/hi";

const CRM_API_URL = import.meta.env.VITE_CRM_API_URL || "http://localhost:5000/api/crm/leads";
// Derive base URL (e.g. "http://localhost:5000/api/crm/auth/login")
const CRM_AUTH_URL = CRM_API_URL.replace(/\/leads\/?$/, "/auth/login");

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("admin"); // 'admin' | 'caller'
  const [username, setUsername] = useState("WeekendUxCRM");
  const [password, setPassword] = useState("WeekendUxCRM@1234567890");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const logoUrl = "/logo.jpeg";

  if (isCrmLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError("");
    if (role === "admin") {
      setUsername("WeekendUxCRM");
      setPassword("WeekendUxCRM@1234567890");
    } else {
      setUsername("WeekendCaller");
      setPassword("WeekendCaller@123");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearCrmToken();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(CRM_AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          role: selectedRole
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Invalid CRM credentials.");
      }

      const token = data.token || "authenticated_crm_session";
      const user = data.user || {
        username: username.trim(),
        role: selectedRole === "admin" ? "crm_admin" : "crm_caller",
        name: selectedRole === "admin" ? "CRM Administrator" : "Team Counselor"
      };

      if (data.permissions) {
        localStorage.setItem("weekendux_crm_permissions", JSON.stringify(data.permissions));
      }

      setCrmToken(token, user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid CRM username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-official/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 rounded-full bg-official/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
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
            <p className="text-gray-400 text-xs mt-1">
              Select login role to access lead management & pipeline
            </p>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-gray-200/80 p-7 rounded-3xl shadow-xl shadow-gray-200/40 space-y-5">
          {/* Role Selection Tabs */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Select Login Role
            </label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === "admin"
                    ? "bg-white text-zinc-950 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <HiOutlineShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>CRM Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("caller")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === "caller"
                    ? "bg-white text-zinc-950 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <HiOutlinePhone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Caller / Staff</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 italic px-1">
              {selectedRole === "admin"
                ? "👑 Admin: Full access with toggle controls to manage staff feature visibility."
                : "🎧 Staff: Access to active lead pipeline, call actions and follow-ups permitted by Admin."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                {selectedRole === "admin" ? "Admin Username" : "Caller / Staff Username"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <HiOutlineUser className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-official/30 focus:border-official focus:bg-white transition-all duration-200"
                  placeholder={selectedRole === "admin" ? "WeekendUxCRM" : "WeekendCaller"}
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
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-official/30 focus:border-official focus:bg-white transition-all duration-200"
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
                <span>
                  Sign In as {selectedRole === "admin" ? "CRM Admin" : "Caller / Staff"}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
