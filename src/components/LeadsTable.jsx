import { useState } from "react";
import {
  HiOutlinePhone,
  HiOutlineChatAlt2,
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineCalendar
} from "react-icons/hi";
import { usePermissions } from "../context/PermissionsContext";
import AdminToggleSwitch from "./AdminToggleSwitch";

const STATUS_OPTIONS = [
  "Pending",
  "Contacted",
  "In Discussion",
  "Demo Scheduled",
  "Enrolled",
  "Lost"
];

export default function LeadsTable({
  leads,
  total,
  page,
  limit,
  onPageChange,
  onSelectLead,
  onUpdateStatus,
  onOpenWhatsApp,
  onDeleteLead,
  loading
}) {
  const { hasAccess, isAdmin } = usePermissions();

  const exportToCsv = () => {
    if (!leads || leads.length === 0) return;

    const headers = ["Name", "Phone", "Email", "Course", "Source", "Received At", "Status", "Priority", "FollowUpDate", "AnswersSummary"];
    const rows = leads.map((l) => [
      `"${l.name || ""}"`,
      `"${l.phone || ""}"`,
      `"${l.email || ""}"`,
      `"${l.course || ""}"`,
      `"${l.source || ""}"`,
      `"${l.createdAt ? new Date(l.createdAt).toLocaleString("en-IN") : ""}"`,
      `"${l.status || ""}"`,
      `"${l.priority || ""}"`,
      `"${l.followUpDate ? new Date(l.followUpDate).toISOString().slice(0, 10) : ""}"`,
      `"${(l.answersSummary || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `weekend_ux_crm_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return "bg-official/20 text-zinc-950 border-official/40";
      case "Contacted":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "In Discussion":
        return "bg-purple-100 text-purple-900 border-purple-300";
      case "Demo Scheduled":
        return "bg-indigo-100 text-indigo-900 border-indigo-300";
      case "Enrolled":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "Lost":
        return "bg-rose-100 text-rose-900 border-rose-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Table Header Bar */}
      <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="font-semibold text-sm text-slate-900">Leads Directory</h3>
          <p className="text-xs text-slate-500 mt-0.5">Showing {leads.length} of {total} registered inquiries</p>
        </div>

        {(isAdmin || hasAccess("exportCsv")) && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={exportToCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium cursor-pointer transition-all shadow-xs"
            >
              <HiOutlineDownload className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
            {isAdmin && <AdminToggleSwitch featureKey="exportCsv" />}
          </div>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Candidate</th>
              <th className="py-3 px-4">Course</th>
              <th className="py-3 px-4">Source</th>
              {/* <th className="py-3 px-4">Received At</th> */}
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Follow-Up</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  No leads found matching your criteria.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead._id}
                  onClick={() => onSelectLead(lead)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  {/* Candidate Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-900 group-hover:text-zinc-950 transition-colors">
                        {lead.name}
                      </div>
                      {(lead.isDuplicate || lead.autoTags?.includes("Duplicate")) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Duplicate
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      {lead.instagramUsername ? (
                        <span className="text-pink-600 font-semibold">@{lead.instagramUsername}</span>
                      ) : (
                        <span>{lead.phone}</span>
                      )}
                      {lead.email && <span className="truncate max-w-30">{lead.email}</span>}
                    </div>
                  </td>

                  {/* Course */}
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    <div className="truncate max-w-45" title={lead.course}>
                      {lead.course}
                    </div>
                  </td>

                  {/* Source */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                        lead.source?.includes("Instagram")
                          ? "bg-pink-50 text-pink-700 border border-pink-200 font-semibold"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {lead.source}
                    </span>
                  </td>

                  {/* Received At */}
                  {/* <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800 flex items-center gap-1.5">
                      <HiOutlineCalendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })
                          : "-"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 pl-5">
                      <HiOutlineClock className="w-3 h-3 text-slate-400" />
                      <span>
                        {lead.createdAt
                          ? new Date(lead.createdAt).toLocaleTimeString("en-IN", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true
                            })
                          : ""}
                      </span>
                    </div>
                  </td> */}

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    {isAdmin || hasAccess("updateStatus") ? (
                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateStatus(lead._id, e.target.value)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(
                          lead.status
                        )}`}
                      >
                        {STATUS_OPTIONS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`inline-block text-[11px] font-semibold px-2 py-1 rounded-full border ${getStatusBadge(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        lead.priority === "Hot"
                          ? "bg-rose-100 text-rose-700"
                          : lead.priority === "Cold"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-official/20 text-zinc-950 border border-official/30"
                      }`}
                    >
                      {lead.priority || "Warm"}
                    </span>
                  </td>

                  {/* Follow-up */}
                  <td className="py-3.5 px-4 text-[11px]">
                    {lead.followUpDate ? (
                      <div className="flex items-center gap-1 text-slate-600">
                        <HiOutlineClock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(lead.followUpDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short"
                          })}
                          {lead.followUpTime ? ` @ ${lead.followUpTime}` : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* Action Icons */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {(isAdmin || hasAccess("callLead")) && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Call Candidate"
                        >
                          <HiOutlinePhone className="w-4 h-4" />
                        </a>
                      )}
                      {(isAdmin || hasAccess("whatsapp")) && (
                        <button
                          onClick={() => onOpenWhatsApp(lead)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="WhatsApp Message"
                        >
                          <HiOutlineChatAlt2 className="w-4 h-4" />
                        </button>
                      )}
                      {(lead.instagramUsername || lead.source?.includes("Instagram")) && (
                        <a
                          href={`https://instagram.com/${lead.instagramUsername || ""}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors flex items-center justify-center"
                          title="Open Instagram Profile"
                        >
                          <span className="text-xs">📸</span>
                        </a>
                      )}
                      <button
                        onClick={() => onSelectLead(lead)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-zinc-950 hover:bg-official/20 transition-colors cursor-pointer"
                        title="View Full Profile"
                      >
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                      {(isAdmin || hasAccess("deleteLead")) && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete lead ${lead.name}?`)) {
                              onDeleteLead(lead._id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {total > limit && (
        <div className="p-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
          <span>Page {page} of {Math.ceil(total / limit)}</span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => onPageChange(page + 1)}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
