import { useState } from "react";
import { HiOutlineX, HiOutlineUserAdd } from "react-icons/hi";

const COURSES = [
  "UI/UX Design Course",
  "Product Design Program",
  "Figma Master Course",
  "Figma Advance Course",
  "Figma Make AI Course",
  "UI Design Course",
  "UX Design Course",
  "Graphic Design Course",
  "Video Editing Course",
  "Agentic AI / Gen AI Development",
  "Full-Stack Development",
  "Front-End Development",
  "Web Development Course",
  "General Inquiry"
];

const SOURCES = [
  "Direct Phone Call",
  "Walk-in Visitor",
  "Friend / Student Referral",
  "Instagram / Meta Ad",
  "Google Search",
  "LinkedIn",
  "Website Lead"
];

export default function AddLeadModal({ isOpen, onClose, onAddLead }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    course: "UI/UX Design Course",
    source: "Direct Phone Call",
    priority: "Warm",
    status: "Pending",
    assignedTo: "Counselor",
    initialNote: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError("Candidate Name and Phone Number are required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onAddLead(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl z-10 overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-official/20 text-zinc-950 font-bold flex items-center justify-center">
              <HiOutlineUserAdd className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Add New Lead</h3>
              <p className="text-[11px] text-slate-500">Manual Entry (Call, Walk-in, Referral)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {error && <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg text-[11px] font-medium">{error}</div>}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Candidate Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-official"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="10-digit number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-official"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email (Optional)</label>
              <input
                type="email"
                placeholder="student@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-official"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Course Interested</label>
              <select
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="Hot">🔥 Hot (Immediate)</option>
                <option value="Warm">⚡ Warm (Interested)</option>
                <option value="Cold">❄️ Cold (Browsing)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Counselor Name</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Initial Discussion Remark / Note</label>
            <textarea
              rows="2"
              placeholder="e.g. Inquired about weekend batch fees. Follow up on Saturday."
              value={formData.initialNote}
              onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-official hover:bg-official/90 text-zinc-950 font-bold rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add to Pipeline"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
