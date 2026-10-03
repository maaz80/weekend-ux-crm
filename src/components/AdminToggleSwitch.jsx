import { usePermissions } from "../context/PermissionsContext";

/**
 * Compact inline toggle button for Admin to control Staff visibility of a feature
 */
export default function AdminToggleSwitch({ featureKey, label = "", size = "sm" }) {
  const { isAdmin, permissions, togglePermission, saving } = usePermissions();

  if (!isAdmin) return null;

  const isEnabled = permissions[featureKey] !== false;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePermission(featureKey);
  };

  const isSmall = size === "sm";

  return (
    <div
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all cursor-pointer select-none group/toggle ${
        isEnabled
          ? "bg-emerald-50/90 hover:bg-emerald-100 border-emerald-300 text-emerald-800"
          : "bg-rose-50/90 hover:bg-rose-100 border-rose-300 text-rose-800"
      }`}
      title={`Staff Access: ${isEnabled ? "ENABLED (Click to Hide for Staff)" : "DISABLED (Click to Enable for Staff)"}`}
    >
      <span className="text-[10px] font-bold tracking-tight">
        {label ? `${label}: ` : "Staff: "}
      </span>

      {/* Pill Switch */}
      <span
        className={`relative inline-flex items-center shrink-0 rounded-full transition-colors ${
          isSmall ? "h-3.5 w-6" : "h-4 w-7"
        } ${isEnabled ? "bg-emerald-500" : "bg-rose-400"}`}
      >
        <span
          className={`inline-block rounded-full bg-white shadow-xs transform transition-transform ${
            isSmall ? "h-2.5 w-2.5" : "h-3 w-3"
          } ${
            isEnabled
              ? isSmall
                ? "translate-x-3"
                : "translate-x-3.5"
              : "translate-x-0.5"
          }`}
        />
      </span>

      <span className="text-[9px] font-extrabold uppercase">
        {isEnabled ? "ON" : "OFF"}
      </span>
    </div>
  );
}
