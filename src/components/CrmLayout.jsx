import { useState } from "react";
import {
  HiOutlineViewBoards,
  HiOutlineTable,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineUserAdd,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineAdjustments
} from "react-icons/hi";
import { clearCrmToken } from "../utils/auth.js";
import { usePermissions, FEATURE_METADATA } from "../context/PermissionsContext.jsx";
import AdminToggleSwitch from "./AdminToggleSwitch.jsx";
import FeatureControlModal from "./FeatureControlModal.jsx";

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
  const {
    isAdmin,
    user: currentUser,
    hasAccess,
    permissions,
    setFeatureControlOpen
  } = usePermissions();

  const handleLogout = () => {
    clearCrmToken();
    window.location.href = "/login";
  };

  const allNavItems = [
    { id: "kanban", permissionKey: "kanban", label: "Pipeline (Kanban)", icon: HiOutlineViewBoards, count: stats?.totalLeads },
    { id: "table", permissionKey: "leadsTable", label: "All Leads Table", icon: HiOutlineTable, count: stats?.totalLeads },
    { id: "followups", permissionKey: "followups", label: "Today's Follow-ups", icon: HiOutlineCalendar, count: stats?.followUpsTodayCount, highlight: stats?.followUpsTodayCount > 0 },
    { id: "analytics", permissionKey: "analytics", label: "Analytics & Reports", icon: HiOutlineChartBar }
  ];

  // For Staff / Caller, only show enabled tabs. For Admin, show all.
  const displayedNavItems = isAdmin
    ? allNavItems
    : allNavItems.filter((item) => hasAccess(item.permissionKey));

  const totalFeaturesCount = Object.keys(FEATURE_METADATA).length;
  const activeFeaturesCount = Object.values(FEATURE_METADATA).filter(
    (f) => permissions[f.id] !== false
  ).length;

  return (
    <div className="min-h-screen max-h-screen bg-slate-50 flex flex-col font-sans">
      <FeatureControlModal />

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
                {isAdmin ? (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-300">
                    👑 ADMIN
                  </span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-300">
                    🎧 CALLER
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Admissions & Lead Management</p>
            </div>
          </div>
        </div>

        {/* Global Search & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative hidden md:block w-48 lg:w-72">
            <HiOutlineSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-official focus:bg-white transition-all"
            />
          </div>

          {/* Admin Feature Controls Button */}
          {isAdmin && (
            <button
              onClick={() => setFeatureControlOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs cursor-pointer transition-all active:scale-95"
              title="Open Feature Access Control Panel"
            >
              <HiOutlineAdjustments className="w-4 h-4 text-official" />
              <span className="hidden sm:inline">Feature Controls</span>
              <span className="px-1.5 py-0.2 rounded-full bg-official text-zinc-950 text-[10px] font-extrabold">
                {activeFeaturesCount}/{totalFeaturesCount}
              </span>
            </button>
          )}

          {/* Sync DB Button & Toggle */}
          {(isAdmin || hasAccess("syncDb")) && (
            <div className="flex items-center gap-1">
              <button
                onClick={onSyncDb}
                disabled={syncing}
                title="Sync all leads from Website and WhatsApp into CRM"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium cursor-pointer transition-all active:scale-95 disabled:opacity-60"
              >
                <HiOutlineRefresh className={`w-4 h-4 text-slate-500 ${syncing ? "animate-spin text-zinc-950" : ""}`} />
                <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync DB"}</span>
              </button>
              {isAdmin && <AdminToggleSwitch featureKey="syncDb" />}
            </div>
          )}

          {/* Add Lead Button & Toggle */}
          {(isAdmin || hasAccess("addLead")) && (
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-official hover:bg-official/90 text-zinc-950 text-xs font-medium shadow-xs cursor-pointer transition-all active:scale-95"
              >
                <HiOutlineUserAdd className="w-4 h-4" />
                <span className="hidden xs:inline">Add Lead</span>
              </button>
              {isAdmin && <AdminToggleSwitch featureKey="addLead" />}
            </div>
          )}

          {/* User Profile Badge & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-official font-bold text-xs flex items-center justify-center shadow-xs">
              {isAdmin ? "👑" : "🎧"}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser?.name || currentUser?.username || (isAdmin ? "CRM Admin" : "Caller")}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {isAdmin ? "Administrator" : "Team Caller"}
              </p>
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
          className={`fixed inset-y-16 left-0 z-20 w-74 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 space-y-1 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Pipeline & Management
              </p>
              {isAdmin && (
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  Toggle for Staff
                </span>
              )}
            </div>

            {displayedNavItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                No active views assigned. Please contact Admin.
              </div>
            ) : (
              displayedNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const isPermittedForStaff = permissions[item.permissionKey] !== false;

                return (
                  <div key={item.id} className="space-y-1">
                    <div
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? "bg-official/20 text-zinc-950 font-bold shadow-xs border border-official/40"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      } ${isAdmin && !isPermittedForStaff ? "border-l-4 border-l-rose-400" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-zinc-950 font-bold" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
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

                        {/* Admin Toggle button right beside navigation tab */}
                        {isAdmin && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <AdminToggleSwitch featureKey={item.permissionKey} size="sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Area: Quick Metrics & Sign Out */}
          <div className="mt-auto">
            {/* Quick Metrics in Sidebar (only if analytics enabled or user is admin) */}
            {(isAdmin || hasAccess("analytics")) && (
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
            )}

            {/* Sign Out Button in Sidebar */}
            <div className="p-3 border-t border-slate-200/80 bg-white">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              >
                <HiOutlineLogout className="w-4 h-4" />
                <span>Sign Out ({isAdmin ? "Admin" : "Caller"})</span>
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
