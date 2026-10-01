import {
  HiOutlinePhone,
  HiOutlineChatAlt2,
  HiOutlineCalendar,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineClock
} from "react-icons/hi";

const PIPELINE_COLUMNS = [
  { id: "Pending", title: "Pending Inquiry", color: "border-official bg-official/15 text-zinc-950", dot: "bg-official" },
  { id: "Contacted", title: "Contacted", color: "border-blue-400 bg-blue-50/40 text-blue-800", dot: "bg-blue-400" },
  { id: "In Discussion", title: "In Discussion", color: "border-purple-400 bg-purple-50/40 text-purple-800", dot: "bg-purple-400" },
  { id: "Demo Scheduled", title: "Demo Booked", color: "border-indigo-400 bg-indigo-50/40 text-indigo-800", dot: "bg-indigo-500" },
  { id: "Enrolled", title: "Enrolled 🎉", color: "border-emerald-400 bg-emerald-50/40 text-emerald-800", dot: "bg-emerald-500" },
  { id: "Lost", title: "Dropped / Lost", color: "border-rose-400 bg-rose-50/40 text-rose-800", dot: "bg-rose-400" }
];

export default function KanbanBoard({
  leads,
  onSelectLead,
  onUpdateStatus,
  onOpenWhatsApp,
  loading
}) {
  const getNextStatus = (current) => {
    const ids = PIPELINE_COLUMNS.map((c) => c.id);
    const idx = ids.indexOf(current);
    return idx < ids.length - 1 ? ids[idx + 1] : null;
  };

  const getPrevStatus = (current) => {
    const ids = PIPELINE_COLUMNS.map((c) => c.id);
    const idx = ids.indexOf(current);
    return idx > 0 ? ids[idx - 1] : null;
  };

  const formatFollowUp = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const isOverdue = d < new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      text: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      isToday,
      isOverdue
    };
  };

  const formatLeadArrival = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    const timeStr = d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    if (isToday) return `Today @ ${timeStr}`;
    if (isYesterday) return `Yesterday @ ${timeStr}`;
    return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} @ ${timeStr}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-official" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[calc(100vh-140px)]">
      {PIPELINE_COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.id);
        const nextStatus = getNextStatus(col.id);
        const prevStatus = getPrevStatus(col.id);

        return (
          <div
            key={col.id}
            className="w-80 shrink-0 bg-slate-100/80 rounded-2xl p-3 border border-slate-200/70 flex flex-col max-h-[calc(100vh-140px)]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                <h3 className="font-semibold text-xs text-slate-800 tracking-tight">{col.title}</h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-xs">
                {colLeads.length}
              </span>
            </div>

            {/* Column Card List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {colLeads.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-slate-400 bg-white/40 rounded-xl border border-dashed border-slate-200">
                  No leads in {col.title}
                </div>
              ) : (
                colLeads.map((lead) => {
                  const followUp = formatFollowUp(lead.followUpDate);
                  return (
                    <div
                      key={lead._id}
                      onClick={() => onSelectLead(lead)}
                      className="bg-white rounded-xl p-3.5 border border-slate-200/80 hover:border-official hover:shadow-md transition-all cursor-pointer group space-y-2.5"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 truncate max-w-[130px]">
                          {lead.source}
                        </span>

                        <div className="flex items-center gap-1">
                          {lead.leadScore && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-official/20 text-zinc-950 border border-official/30">
                              {lead.leadScore}pts
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
                      </div>

                      {/* Lead Name & Course */}
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-semibold text-slate-900 group-hover:text-zinc-950 transition-colors">
                            {lead.name}
                          </h4>
                          {(lead.isDuplicate || lead.autoTags?.includes("Duplicate")) && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                              Duplicate
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{lead.course}</p>
                      </div>

                      {/* Lead Arrival Time */}
                      {lead.createdAt && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <HiOutlineClock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatLeadArrival(lead.createdAt)}</span>
                        </div>
                      )}

                      {/* Auto Tags */}
                      {lead.autoTags && lead.autoTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {lead.autoTags.slice(0, 3).map((tag, tIdx) => (
                            <span key={tIdx} className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Follow-up Indicator */}
                      {followUp && (
                        <div
                          className={`flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-md ${
                            followUp.isToday
                              ? "bg-official/20 text-zinc-950 border border-official/30 font-semibold"
                              : followUp.isOverdue
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {followUp.isToday
                              ? "Follow-up Today"
                              : followUp.isOverdue
                              ? `Overdue (${followUp.text})`
                              : `Follow-up: ${followUp.text}`}
                            {lead.followUpTime ? ` @ ${lead.followUpTime}` : ""}
                          </span>
                        </div>
                      )}

                      {/* Card Bottom Actions */}
                      <div
                        className="pt-2 border-t border-slate-100 flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          {/* Call Button */}
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Call Candidate"
                          >
                            <HiOutlinePhone className="w-3.5 h-3.5" />
                          </a>

                          {/* WhatsApp Button */}
                          <button
                            onClick={() => onOpenWhatsApp(lead)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Send WhatsApp Message"
                          >
                            <HiOutlineChatAlt2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Pipeline Move Buttons */}
                        <div className="flex items-center gap-1">
                          {prevStatus && (
                            <button
                              onClick={() => onUpdateStatus(lead._id, prevStatus)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-[10px]"
                              title={`Move back to ${prevStatus}`}
                            >
                              <HiOutlineChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              onClick={() => onUpdateStatus(lead._id, nextStatus)}
                              className="flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-100 hover:bg-official/20 hover:text-zinc-950 text-slate-600 text-[10px] font-medium transition-colors"
                              title={`Advance to ${nextStatus}`}
                            >
                              <span>Next</span>
                              <HiOutlineChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
