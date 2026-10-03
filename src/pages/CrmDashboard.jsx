import { useState, useEffect } from "react";
import CrmLayout from "../components/CrmLayout";
import KanbanBoard from "../components/KanbanBoard";
import LeadsTable from "../components/LeadsTable";
import LeadProfileDrawer from "../components/LeadProfileDrawer";
import AddLeadModal from "../components/AddLeadModal";
import WhatsAppModal from "../components/WhatsAppModal";
import AnalyticsView from "../components/AnalyticsView";
import { usePermissions } from "../context/PermissionsContext";
import {
  fetchLeads,
  fetchAnalytics,
  createNewLead,
  updateLeadStatus,
  addLeadNote,
  scheduleLeadFollowUp,
  triggerLeadSync,
  deleteLeadRecord
} from "../utils/api";
import {
  HiOutlineFilter,
  HiOutlineSparkles,
  HiOutlineClock,
  HiCheckCircle,
  HiExclamationCircle,
  HiX
} from "react-icons/hi";

export default function CrmDashboard() {
  const { hasAccess, isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState("kanban"); // 'kanban', 'table', 'followups', 'analytics'
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-switch to available tab if current activeTab is disabled for Staff
  useEffect(() => {
    if (isAdmin) return;
    const tabPermMap = {
      kanban: "kanban",
      table: "leadsTable",
      followups: "followups",
      analytics: "analytics"
    };

    const currentPerm = tabPermMap[activeTab];
    if (currentPerm && !hasAccess(currentPerm)) {
      const candidates = [
        { id: "kanban", key: "kanban" },
        { id: "table", key: "leadsTable" },
        { id: "followups", key: "followups" },
        { id: "analytics", key: "analytics" }
      ];
      const nextAvailable = candidates.find((c) => hasAccess(c.key));
      if (nextAvailable && nextAvailable.id !== activeTab) {
        setActiveTab(nextAvailable.id);
      }
    }
  }, [activeTab, hasAccess, isAdmin]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Modals & Drawers
  const [selectedLead, setSelectedLead] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppLead, setWhatsAppLead] = useState(null);
  const [newLeadAlert, setNewLeadAlert] = useState(null);

  // Load stats and leads (silent background update support)
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const followUpParam = activeTab === "followups" ? "today" : undefined;
      const [leadsRes, statsRes] = await Promise.all([
        fetchLeads({
          search: searchQuery,
          status: statusFilter,
          course: courseFilter,
          priority: priorityFilter,
          followUp: followUpParam,
          page,
          limit
        }),
        fetchAnalytics()
      ]);

      const newLeads = leadsRes.leads || [];
      const newTotal = leadsRes.total || 0;

      // Detect new incoming lead in real-time
      if (total > 0 && newTotal > total && newLeads.length > 0) {
        const latest = newLeads[0];
        setNewLeadAlert(latest);
        setTimeout(() => setNewLeadAlert(null), 8000);
      }

      setLeads(newLeads);
      setTotal(newTotal);
      setStats(statsRes.metrics || null);

      // Keep drawer lead updated if open
      if (selectedLead) {
        const updated = newLeads.find((l) => l._id === selectedLead._id);
        if (updated) setSelectedLead(updated);
      }
    } catch (err) {
      console.error("Failed to load CRM data:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Initial load & when filters change
  useEffect(() => {
    loadData(false);
  }, [searchQuery, statusFilter, courseFilter, priorityFilter, activeTab, page]);

  // Automated Real-Time Background Polling (Every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      loadData(true); // silent background fetch
    }, 4000);
    return () => clearInterval(timer);
  }, [searchQuery, statusFilter, courseFilter, priorityFilter, activeTab, page, total, selectedLead]);

  // Sync Database
  const handleSyncDb = async () => {
    setSyncing(true);
    try {
      const res = await triggerLeadSync();
      const msg = res.importedCount > 0
        ? `Sync successful! ${res.importedCount} new inquiry imported.`
        : `Database in sync. All ${res.existingCount || 0} inquiries are up to date.`;
      showToast(msg, "success");
      loadData();
    } catch (err) {
      showToast("Error syncing database: " + err.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  // Status Update
  const handleStatusChange = async (id, status, extra = {}) => {
    try {
      await updateLeadStatus(id, { status, ...extra });
      loadData();
    } catch (err) {
      showToast("Failed to update status: " + err.message, "error");
    }
  };

  // Add Note
  const handleAddNote = async (id, notePayload) => {
    try {
      await addLeadNote(id, notePayload);
      showToast("Note added successfully!", "success");
      loadData();
    } catch (err) {
      showToast("Failed to add note: " + err.message, "error");
    }
  };

  // Schedule Follow Up
  const handleScheduleFollowUp = async (id, payload) => {
    try {
      await scheduleLeadFollowUp(id, payload);
      showToast("Follow-up scheduled successfully!", "success");
      loadData();
    } catch (err) {
      showToast("Failed to schedule follow-up: " + err.message, "error");
    }
  };

  // Create Lead
  const handleCreateLead = async (formData) => {
    await createNewLead(formData);
    loadData();
  };

  // Delete Lead
  const handleDeleteLead = async (id) => {
    try {
      await deleteLeadRecord(id);
      if (selectedLead?._id === id) setSelectedLead(null);
      showToast("Lead deleted successfully", "success");
      loadData();
    } catch (err) {
      showToast("Failed to delete lead: " + err.message, "error");
    }
  };

  // Open WhatsApp
  const handleOpenWhatsApp = (lead) => {
    setWhatsAppLead(lead);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <CrmLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenAddModal={() => setIsAddModalOpen(true)}
      onSyncDb={handleSyncDb}
      syncing={syncing}
      stats={stats}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div className="space-y-4">
        {/* HubSpot-style Live New Lead Alert Banner */}
        {newLeadAlert && (
          <div className="bg-official text-zinc-950 border border-zinc-900/10 p-3.5 rounded-2xl shadow-sm flex items-center justify-between animate-slide-in">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-900"></span>
              </span>
              <div>
                <p className="font-bold text-xs">
                  New Lead Just Captured: <span className="underline">{newLeadAlert.name}</span> ({newLeadAlert.course})
                </p>
                <p className="text-[11px] text-slate-900/80">
                  Source: {newLeadAlert.source} • Priority: {newLeadAlert.priority || "Warm"} ({newLeadAlert.leadScore || 60}pts) • Time: {new Date(newLeadAlert.createdAt || Date.now()).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedLead(newLeadAlert)}
                className="px-3 py-1 bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-slate-800 cursor-pointer"
              >
                View Profile
              </button>
              <button
                onClick={() => setNewLeadAlert(null)}
                className="p-1 text-slate-900/60 hover:text-slate-950 text-xs font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Global Filter Bar (Hidden in Analytics Tab) */}
        {activeTab !== "analytics" && (
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-2">
                <HiOutlineFilter className="w-4 h-4 text-slate-400" />
                <span>Filters:</span>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-official"
              >
                <option value="All">All Pipeline Stages</option>
                <option value="Pending">Pending</option>
                <option value="Contacted">Contacted</option>
                <option value="In Discussion">In Discussion</option>
                <option value="Demo Scheduled">Demo Scheduled</option>
                <option value="Enrolled">Enrolled</option>
                <option value="Lost">Lost / Dropped</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-official"
              >
                <option value="All">All Priorities</option>
                <option value="Hot">🔥 Hot Leads</option>
                <option value="Warm">⚡ Warm Leads</option>
                <option value="Cold">❄️ Cold Leads</option>
              </select>

              {/* Course Filter */}
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-official max-w-50"
              >
                <option value="All">All Programs</option>
                <option value="UI/UX Design Course">UI/UX Design Course</option>
                <option value="Product Design Program">Product Design Program</option>
                <option value="Figma Master Course">Figma Master Course</option>
                <option value="Figma Advance Course">Figma Advance Course</option>
                <option value="Figma Make AI Course">Figma Make AI Course</option>
                <option value="Agentic AI / Gen AI Development">Agentic AI / Gen AI Development</option>
                <option value="Full-Stack Development">Full-Stack Development</option>
                <option value="Front-End Development">Front-End Development</option>
              </select>

              {/* Clear Filters Button */}
              {(statusFilter !== "All" || priorityFilter !== "All" || courseFilter !== "All" || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter("All");
                    setPriorityFilter("All");
                    setCourseFilter("All");
                    setSearchQuery("");
                  }}
                  className="text-xs text-zinc-900 hover:text-black font-semibold cursor-pointer underline ml-1"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Total Badge */}
            <div className="text-xs text-slate-500 font-medium">
              Total Found: <span className="font-bold text-slate-900">{total} leads</span>
            </div>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === "kanban" && (isAdmin || hasAccess("kanban")) && (
          <KanbanBoard
            leads={leads}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onUpdateStatus={handleStatusChange}
            onOpenWhatsApp={handleOpenWhatsApp}
            loading={loading}
          />
        )}

        {(activeTab === "table" || activeTab === "followups") && (isAdmin || hasAccess(activeTab === "table" ? "leadsTable" : "followups")) && (
          <LeadsTable
            leads={leads}
            total={total}
            page={page}
            limit={limit}
            onPageChange={(p) => setPage(p)}
            onSelectLead={(lead) => setSelectedLead(lead)}
            onUpdateStatus={handleStatusChange}
            onOpenWhatsApp={handleOpenWhatsApp}
            onDeleteLead={handleDeleteLead}
            loading={loading}
          />
        )}

        {activeTab === "analytics" && (isAdmin || hasAccess("analytics")) && <AnalyticsView stats={stats} loading={loading} />}

        {/* Fallback if all 4 views are disabled for Staff */}
        {!isAdmin &&
          !hasAccess("kanban") &&
          !hasAccess("leadsTable") &&
          !hasAccess("followups") &&
          !hasAccess("analytics") && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <span className="text-4xl">🔒</span>
              <h3 className="font-bold text-slate-800 text-base">Pipeline Views Restricted</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your administrator has temporarily turned off CRM pipeline and leads views for team members.
                Please contact the CRM administrator to enable access.
              </p>
            </div>
          )}
      </div>

      {/* Slide-over Profile Drawer */}
      {selectedLead && (
        <LeadProfileDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={handleStatusChange}
          onAddNote={handleAddNote}
          onScheduleFollowUp={handleScheduleFollowUp}
          onOpenWhatsApp={handleOpenWhatsApp}
        />
      )}

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLead={handleCreateLead}
      />

      {/* WhatsApp Message Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setWhatsAppLead(null);
        }}
        lead={whatsAppLead}
        onLogMessage={handleAddNote}
      />

      {/* Floating Modern Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md max-w-md">
          {toast.type === "error" ? (
            <HiExclamationCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <HiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-medium leading-relaxed">
            {toast.message}
          </span>
          <button
            onClick={() => setToast(null)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-auto shrink-0"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      )}
    </CrmLayout>
  );
}
