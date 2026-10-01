import { useState } from "react";
import { HiOutlineX, HiOutlinePaperAirplane, HiOutlineChatAlt2 } from "react-icons/hi";

export default function WhatsAppModal({ isOpen, onClose, lead, onLogMessage }) {
  if (!isOpen || !lead) return null;

  const phone = String(lead.phone || "").replace(/\D/g, "");
  const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

  const templates = [
    {
      id: "syllabus",
      title: "📘 Syllabus & Brochure",
      text: `Hi ${lead.name}! Thank you for your inquiry about the *${lead.course}* at *Weekend UX*. 🎓\n\nHere are the course highlights:\n• Industry-Standard Curriculum (Figma, AI Tools, Live Projects)\n• 1-on-1 Portfolio Mentorship & Review\n• Placement Assistance & Interview Prep\n\nWould you like us to share the detailed syllabus brochure PDF with you here?`
    },
    {
      id: "demo",
      title: "🎯 Free Demo Invitation",
      text: `Hi ${lead.name}! 🚀 We are hosting an interactive *Live Demo Session* for *${lead.course}* with our Lead UX Instructor.\n\nWould you like us to reserve a free seat for you in the upcoming session? Please let us know so we can share the Zoom link!`
    },
    {
      id: "fees",
      title: "💳 Fees & Batch Timings",
      text: `Hi ${lead.name}! Here are the upcoming batch details for *${lead.course}*:\n\n📅 *Weekend Batches*: Sat & Sun (Flexible timings)\n📅 *Weekday Evenings*: Mon-Fri (Live Interactive)\n\nSpecial early-bird discount is currently active for this month. Shall we share the fee breakup and EMI options?`
    },
    {
      id: "followup",
      title: "👋 Quick Follow-up",
      text: `Hi ${lead.name}! This is from the Weekend UX Admissions Desk. We noticed you were interested in the *${lead.course}*. How can we help answer any questions or guide your design learning journey today?`
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState("syllabus");
  const [messageText, setMessageText] = useState(templates[0].text);

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl.id);
    setMessageText(tpl.text);
  };

  const handleSend = () => {
    if (onLogMessage) {
      onLogMessage(lead._id, {
        author: "Counselor",
        text: `[Sent WhatsApp Message]: "${messageText.slice(0, 100)}..."`
      });
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
    window.open(url, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl z-10 overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-emerald-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <HiOutlineChatAlt2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Send WhatsApp Message</h3>
              <p className="text-[11px] text-slate-500">
                To: <span className="font-semibold text-slate-800">{lead.name}</span> (+{cleanPhone})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Template Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Select Quick Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplate === t.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold shadow-xs"
                      : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <p className="text-xs truncate">{t.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Message Preview & Editor */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Message Content (Editable)
            </label>
            <textarea
              rows="6"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
              <span>Launch WhatsApp Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
