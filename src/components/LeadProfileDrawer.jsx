import { useState } from "react";
import {
  HiOutlineX,
  HiOutlinePhone,
  HiOutlineChatAlt2,
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineAcademicCap,
  HiOutlineSparkles,
  HiOutlineClock
} from "react-icons/hi";
import { usePermissions } from "../context/PermissionsContext";
import AdminToggleSwitch from "./AdminToggleSwitch";

const STATUSES = [
  { id: "Pending", label: "Pending", color: "bg-official/20 text-zinc-950 border-official/40" },
  { id: "Contacted", label: "Contacted", color: "bg-blue-100 text-blue-900 border-blue-300" },
  { id: "In Discussion", label: "In Discussion", color: "bg-purple-100 text-purple-900 border-purple-300" },
  { id: "Demo Scheduled", label: "Demo Scheduled", color: "bg-indigo-100 text-indigo-900 border-indigo-300" },
  { id: "Enrolled", label: "Enrolled 🎉", color: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  { id: "Lost", label: "Dropped / Lost", color: "bg-rose-100 text-rose-900 border-rose-300" }
];

export default function LeadProfileDrawer({
  lead,
  onClose,
  onUpdateStatus,
  onAddNote,
  onScheduleFollowUp,
  onOpenWhatsApp
}) {
  const { hasAccess, isAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState("notes"); // 'notes', 'answers', 'followup'
  const [newNote, setNewNote] = useState("");
  const [counselorName, setCounselorName] = useState("Counselor");
  const [savingNote, setSavingNote] = useState(false);

  // Follow-up form state
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpTime, setFollowUpTime] = useState("");
  const [followUpRemark, setFollowUpRemark] = useState("");
  const [scheduling, setScheduling] = useState(false);

  // Enrollment / Drop states
  const [showEnrolledInput, setShowEnrolledInput] = useState(false);
  const [feeAmount, setFeeAmount] = useState("");
  const [showLostInput, setShowLostInput] = useState(false);
  const [lostReason, setLostReason] = useState("");

  if (!lead) return null;

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      await onAddNote(lead._id, {
        author: counselorName || "Counselor",
        text: newNote.trim()
      });
      setNewNote("");
    } finally {
      setSavingNote(false);
    }
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpDate) return;
    setScheduling(true);
    try {
      await onScheduleFollowUp(lead._id, {
        date: followUpDate,
        time: followUpTime,
        note: followUpRemark,
        counselorName: counselorName || "Counselor"
      });
      setFollowUpDate("");
      setFollowUpTime("");
      setFollowUpRemark("");
    } finally {
      setScheduling(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (newStatus === "Enrolled") {
      setShowEnrolledInput(true);
      setShowLostInput(false);
    } else if (newStatus === "Lost") {
      setShowLostInput(true);
      setShowEnrolledInput(false);
    } else {
      setShowEnrolledInput(false);
      setShowLostInput(false);
      onUpdateStatus(lead._id, newStatus);
    }
  };

  const confirmEnrolled = () => {
    onUpdateStatus(lead._id, "Enrolled", { enrollmentFee: Number(feeAmount) || 0 });
    setShowEnrolledInput(false);
  };

  const confirmLost = () => {
    onUpdateStatus(lead._id, "Lost", { dropReason: lostReason || "Not Interested" });
    setShowLostInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-slide-in">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">{lead.name}</h2>
              {(lead.isDuplicate || lead.autoTags?.includes("Duplicate")) && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  Duplicate Lead
                </span>
              )}
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  lead.priority === "Hot"
                    ? "bg-rose-100 text-rose-700"
                    : lead.priority === "Cold"
                    ? "bg-slate-100 text-slate-500"
                    : "bg-official/20 text-zinc-950 border border-official/30"
                }`}
              >
                {lead.priority || "Warm"}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <HiOutlineAcademicCap className="w-4 h-4 text-zinc-800" />
              <span className="font-medium text-slate-700">{lead.course}</span>
            </p>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Contact & Info Bar */}
        <div className="p-4 bg-white border-b border-slate-100 grid grid-cols-2 gap-3.5 text-xs">
          <div className="flex items-center gap-2">
            <HiOutlinePhone className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Phone Number</p>
              <a href={`tel:${lead.phone}`} className="font-semibold text-slate-800 hover:text-zinc-900">
                {lead.phone}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HiOutlineMail className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">
                {lead.instagramUsername ? "Instagram Handle" : "Email Address"}
              </p>
              {lead.instagramUsername ? (
                <a
                  href={`https://instagram.com/${lead.instagramUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-pink-600 hover:underline"
                >
                  @{lead.instagramUsername}
                </a>
              ) : (
                <p className="font-medium text-slate-800 truncate">{lead.email || "Not Provided"}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HiOutlineClock className="w-4 h-4 text-zinc-700 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Lead Received At</p>
              <p className="font-semibold text-slate-800">
                {lead.createdAt
                  ? new Date(lead.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true
                    })
                  : "Not Available"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HiOutlineClipboardList className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-medium">Lead Source</p>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                {lead.source?.includes("Instagram") && <span className="text-pink-600 font-bold">📸</span>}
                <span>{lead.source || "Website Lead"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center gap-2.5">
          {(isAdmin || hasAccess("callLead")) && (
            <a
              href={`tel:${lead.phone}`}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
            >
              <HiOutlinePhone className="w-4 h-4" />
              <span>Call Candidate</span>
            </a>
          )}

          {(isAdmin || hasAccess("whatsapp")) && (
            <button
              onClick={() => onOpenWhatsApp(lead)}
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer transition-colors shadow-xs"
            >
              <HiOutlineChatAlt2 className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          )}

          {(lead.instagramUsername || lead.source?.includes("Instagram")) && (
            <a
              href={`https://instagram.com/${lead.instagramUsername || ""}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-xs font-medium cursor-pointer transition-all shadow-xs"
            >
              <span>📸 Instagram</span>
            </a>
          )}
        </div>

        {/* Pipeline Stage Switcher */}
        <div className="p-4 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Current Stage
            </label>
            {isAdmin && <AdminToggleSwitch featureKey="updateStatus" />}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {STATUSES.map((st) => {
              const canEditStatus = isAdmin || hasAccess("updateStatus");
              return (
                <button
                  key={st.id}
                  disabled={!canEditStatus}
                  onClick={() => canEditStatus && handleStatusChange(st.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                    canEditStatus ? "cursor-pointer" : "cursor-not-allowed opacity-75"
                  } ${
                    lead.status === st.id
                      ? `${st.color} font-semibold shadow-xs`
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>

          {/* Prompt for Enrollment Fee */}
          {showEnrolledInput && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <label className="text-xs font-semibold text-emerald-900 block">Enrollment Fee Amount (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-lg focus:outline-none"
                />
                <button
                  onClick={confirmEnrolled}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 cursor-pointer"
                >
                  Save Enrolled
                </button>
              </div>
            </div>
          )}

          {/* Prompt for Lost Reason */}
          {showLostInput && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <label className="text-xs font-semibold text-rose-900 block">Reason for Drop / Lost</label>
              <div className="flex gap-2">
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg focus:outline-none"
                >
                  <option value="">Select reason...</option>
                  <option value="High Fee / Budget Issue">High Fee / Budget Issue</option>
                  <option value="Timing / Batch Schedule Conflict">Timing / Batch Schedule Conflict</option>
                  <option value="Joined Competitor">Joined Competitor</option>
                  <option value="Not Responding">Not Responding</option>
                  <option value="Changed Learning Plan">Changed Learning Plan</option>
                </select>
                <button
                  onClick={confirmLost}
                  className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-500 cursor-pointer"
                >
                  Save Lost
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "notes"
                ? "border-official text-zinc-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Counselor Notes ({lead.notes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("answers")}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "answers"
                ? "border-official text-zinc-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Chatbot & Answers
          </button>
          <button
            onClick={() => setActiveTab("followup")}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "followup"
                ? "border-official text-zinc-950 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Follow-Up Schedule
          </button>
        </div>

        {/* Drawer Body (Tabs) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: NOTES TIMELINE */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              {/* Admin Toggle */}
              {isAdmin && (
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Staff Note Permissions</span>
                  <AdminToggleSwitch featureKey="addNotes" />
                </div>
              )}

              {/* Add Note Form */}
              {isAdmin || hasAccess("addNotes") ? (
                <form onSubmit={handleNoteSubmit} className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Add Call Remark / Discussion Note:</span>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={counselorName}
                      onChange={(e) => setCounselorName(e.target.value)}
                      className="w-28 text-right bg-transparent border-b border-slate-300 focus:outline-none text-[11px]"
                    />
                  </div>
                  <textarea
                    rows="2"
                    placeholder="e.g. Spoke with candidate. Looking for UI/UX weekend batch. Budget is fine. Call again on Tuesday 4 PM."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-official"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingNote || !newNote.trim()}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40"
                    >
                      {savingNote ? "Saving..." : "Add Note"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  Note creation is currently disabled for team members by Admin.
                </div>
              )}

              {/* Notes List */}
              <div className="space-y-3">
                {(!lead.notes || lead.notes.length === 0) ? (
                  <p className="text-center py-6 text-xs text-slate-400">No counselor notes recorded yet.</p>
                ) : (
                  lead.notes
                    .slice()
                    .reverse()
                    .map((n, idx) => (
                      <div key={idx} className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1 shadow-xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-800">{n.author || "Counselor"}</span>
                          <span className="text-slate-400">
                            {new Date(n.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "numeric",
                              hour12: true
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{n.text}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ANSWERS & CHATBOT INFO */}
          {activeTab === "answers" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-official/10 border border-official/30 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-950">
                  <HiOutlineSparkles className="w-4 h-4 text-zinc-900" />
                  <span>Captured Answers & Preferences</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {lead.answersSummary || "No detailed answers provided during inquiry."}
                </p>
              </div>

              {/* Raw Answers details if available */}
              {lead.answers && Object.keys(lead.answers).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Detailed Attributes
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 text-xs">
                    {Object.entries(lead.answers).map(([key, val]) => (
                      <div key={key} className="flex items-start justify-between gap-2 border-b border-slate-200/50 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-slate-500 font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                        <span className="text-slate-900 font-semibold text-right">
                          {typeof val === "object" ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SCHEDULE FOLLOW-UP */}
          {activeTab === "followup" && (
            <div className="space-y-4">
              {isAdmin && (
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Staff Follow-Up Permissions</span>
                  <AdminToggleSwitch featureKey="scheduleFollowup" />
                </div>
              )}

              {isAdmin || hasAccess("scheduleFollowup") ? (
                <form onSubmit={handleFollowUpSubmit} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <HiOutlineClock className="w-4 h-4 text-zinc-800" />
                    <span>Schedule Next Follow-Up Call</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Follow-Up Date *</label>
                    <input
                      type="date"
                      required
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Preferred Time Slot</label>
                    <input
                      type="time"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Follow-Up Objective / Reminder</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Call to confirm attendance for Demo class and answer syllabus questions."
                      value={followUpRemark}
                      onChange={(e) => setFollowUpRemark(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={scheduling || !followUpDate}
                    className="w-full py-2 bg-official hover:bg-official/90 text-zinc-950 font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-xs disabled:opacity-40"
                  >
                    {scheduling ? "Scheduling..." : "Save Follow-Up Reminder"}
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  Follow-up scheduling is currently disabled for team members by Admin.
                </div>
              )}

              {lead.followUpDate && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-800">Active Follow-up Reminder:</span>
                  <p>
                    {new Date(lead.followUpDate).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                    {lead.followUpTime ? ` at ${lead.followUpTime}` : ""}
                  </p>
                  {lead.followUpNote && <p className="italic text-slate-500">"{lead.followUpNote}"</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
