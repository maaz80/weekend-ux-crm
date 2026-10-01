import { useState } from "react";
import {
  HiOutlineViewBoards,
  HiOutlineTable,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineUserAdd,
  HiOutlineRefresh,
  HiOutlinePhone,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout
} from "react-icons/hi";
import { clearCrmToken, getCrmUser } from "../utils/auth.js";

export default function CrmLayout({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onSyncDb,
  syncing,
  stats,
  searchQuery,
  setSearchQuery,
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = getCrmUser();

  const handleLogout = () => {
    clearCrmToken();
    window.location.href = "/login";
  };

  const navItems = [
    { id: "kanban", label: "Pipeline (Kanban)", icon: HiOutlineViewBoards, count: stats?.totalLeads },
    { id: "table", label: "All Leads Table", icon: HiOutlineTable, count: stats?.totalLeads },
    { id: "followups", label: "Today's Follow-ups", icon: HiOutlineCalendar, count: stats?.followUpsTodayCount, highlight: stats?.followUpsTodayCount > 0 },
    { id: "analytics", label: "Analytics & Reports", icon: HiOutlineChartBar }
  ];

  return (
    <div className="min-h-screen max-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="min-h-16 max-h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-official flex items-center justify-center font-bold text-zinc-950 text-base shadow-sm">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">Weekend UX</span>
                <span className="bg-official/20 text-zinc-950 text-[11px] font-bold px-2 py-0.5 rounded-full border border-official/30">
                  CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Admissions & Lead Management</p>
            </div>
          </div>
        </div>

        {/* Global Search & Actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-64 lg:w-80">
            <HiOutlineSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-official focus:bg-white transition-all"
            />
          </div>

          {/* Sync Button */}
          <button
            onClick={onSyncDb}
            disabled={syncing}
            title="Sync all leads from Website and WhatsApp into CRM"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium cursor-pointer transition-all active:scale-95 disabled:opacity-60"
          >
            <HiOutlineRefresh className={`w-4 h-4 text-slate-500 ${syncing ? "animate-spin text-zinc-950" : ""}`} />
            <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync DB"}</span>
          </button>

          {/* Add Lead Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-official hover:bg-official/90 text-zinc-950 text-xs font-medium shadow-xs cursor-pointer transition-all active:scale-95"
          >
            <HiOutlineUserAdd className="w-4 h-4" />
            <span>Add Lead</span>
          </button>

          {/* Counselor Profile Badge & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-official font-bold text-xs flex items-center justify-center shadow-xs">
              {/* {(currentUser.username || "Admin").slice(0, 2).toUpperCase()} */}
              W
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {/* {currentUser.username || "Admin"} */}
                Weekend UX
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">Counselor</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <HiOutlineLogout className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-16 left-0 z-20 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 space-y-1 flex-1 overflow-y-auto">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Pipeline & Management
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-official/20 text-zinc-950 font-bold shadow-xs border border-official/40"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-zinc-950 font-bold" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        item.highlight
                          ? "bg-red-500 text-white animate-pulse"
                          : isActive
                          ? "bg-official text-zinc-950 font-bold"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Area: Quick Metrics & Sign Out */}
          <div className="mt-auto">
            {/* Quick Metrics in Sidebar */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>Conversion Rate</span>
                <span className="font-semibold text-emerald-600">{stats?.conversionRate || 0}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(stats?.conversionRate || 0, 100)}%` }}
                />
              </div>
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Enrolled: {stats?.enrolledCount || 0}</span>
                <span>Pending: {stats?.pendingCount || 0}</span>
              </div>
            </div>

            {/* Sign Out Button in Sidebar */}
            <div className="p-3 border-t border-slate-200/80 bg-white">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              >
                <HiOutlineLogout className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
