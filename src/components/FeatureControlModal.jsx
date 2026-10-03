import { usePermissions, FEATURE_METADATA } from "../context/PermissionsContext";
import {
  HiOutlineX,
  HiOutlineAdjustments,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineShieldCheck,
  HiOutlineSparkles
} from "react-icons/hi";

export default function FeatureControlModal() {
  const {
    isAdmin,
    permissions,
    togglePermission,
    toggleAll,
    isFeatureControlOpen,
    setFeatureControlOpen,
    saving
  } = usePermissions();

  if (!isAdmin || !isFeatureControlOpen) return null;

  const featureList = Object.values(FEATURE_METADATA);
  const totalFeatures = featureList.length;
  const activeCount = featureList.filter((f) => permissions[f.id] !== false).length;

  const categories = Array.from(new Set(featureList.map((f) => f.category)));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setFeatureControlOpen(false)}
      />

      {/* Slide-over Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-official text-zinc-950 flex items-center justify-center font-bold">
                <HiOutlineAdjustments className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Feature Access Controls</h2>
            </div>
            <p className="text-xs text-slate-500">
              Turn CRM features ON or OFF for Staff / Callers in real time.
            </p>
          </div>

          <button
            onClick={() => setFeatureControlOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Stats & Quick Actions Bar */}
        <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Staff Access:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                activeCount === totalFeatures
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : activeCount === 0
                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {activeCount} of {totalFeatures} Features Enabled
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAll(true)}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
            >
              Enable All
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => toggleAll(false)}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
            >
              Disable All
            </button>
          </div>
        </div>

        {/* Informational Alert */}
        <div className="mx-5 my-3 p-3 rounded-xl bg-official/10 border border-official/30 flex items-center gap-2.5 text-xs text-zinc-900">
          <HiOutlineShieldCheck className="w-5 h-5 text-zinc-950 shrink-0" />
          <p className="text-[11px] leading-tight">
            <strong>Admin Note:</strong> You will always see all features. Features toggled{" "}
            <span className="text-rose-600 font-bold">OFF</span> will be completely hidden from
            Staff / Callers.
          </p>
        </div>

        {/* Features List by Category */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
          {categories.map((category) => {
            const items = featureList.filter((f) => f.category === category);
            return (
              <div key={category} className="space-y-2.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((feat) => {
                    const isEnabled = permissions[feat.id] !== false;
                    return (
                      <div
                        key={feat.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isEnabled
                            ? "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300"
                            : "bg-slate-50 border-rose-200/70 opacity-80"
                        }`}
                      >
                        <div className="space-y-0.5 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">
                              {feat.title}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                                isEnabled
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {isEnabled ? "Visible to Staff" : "Hidden for Staff"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight">
                            {feat.description}
                          </p>
                        </div>

                        {/* Large interactive toggle switch */}
                        <button
                          type="button"
                          onClick={() => togglePermission(feat.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isEnabled ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              isEnabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            {saving ? "Saving changes to database..." : "All changes saved in real-time"}
          </span>
          <button
            onClick={() => setFeatureControlOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
