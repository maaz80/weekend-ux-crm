import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { isCrmAdmin, isCrmCaller, getCrmUser } from "../utils/auth.js";
import { fetchCrmPermissions, saveCrmPermissions } from "../utils/api.js";

export const DEFAULT_PERMISSIONS = {
  kanban: true,
  leadsTable: true,
  followups: true,
  analytics: true,
  addLead: true,
  syncDb: true,
  exportCsv: true,
  callLead: true,
  whatsapp: true,
  deleteLead: true,
  updateStatus: true,
  addNotes: true,
  scheduleFollowup: true
};

export const FEATURE_METADATA = {
  kanban: {
    id: "kanban",
    title: "Pipeline (Kanban)",
    description: "Visual stage-by-stage lead pipeline board",
    category: "Main Views"
  },
  leadsTable: {
    id: "leadsTable",
    title: "All Leads Table",
    description: "Detailed paginated inquiries table with filters",
    category: "Main Views"
  },
  followups: {
    id: "followups",
    title: "Today's Follow-ups",
    description: "Scheduled calls due today with overdue alerts",
    category: "Main Views"
  },
  analytics: {
    id: "analytics",
    title: "Analytics & Reports",
    description: "Conversion metrics & stage performance graphs",
    category: "Main Views"
  },
  addLead: {
    id: "addLead",
    title: "Add New Lead",
    description: "Button and modal to manually input new candidate inquiries",
    category: "Actions"
  },
  syncDb: {
    id: "syncDb",
    title: "Sync Database",
    description: "Button to auto-sync leads from website and WhatsApp",
    category: "Actions"
  },
  exportCsv: {
    id: "exportCsv",
    title: "Export to CSV",
    description: "Download inquiries list as a spreadsheet CSV file",
    category: "Actions"
  },
  callLead: {
    id: "callLead",
    title: "Direct Phone Call",
    description: "Quick phone dial links in tables, cards & drawers",
    category: "Contact & Communication"
  },
  whatsapp: {
    id: "whatsapp",
    title: "WhatsApp Message",
    description: "WhatsApp quick chat button and logging modal",
    category: "Contact & Communication"
  },
  deleteLead: {
    id: "deleteLead",
    title: "Delete Lead Record",
    description: "Trash icon to delete inquiry from CRM database",
    category: "Management"
  },
  updateStatus: {
    id: "updateStatus",
    title: "Update Pipeline Stage",
    description: "Change lead status dropdowns & advance pipeline stages",
    category: "Pipeline Management"
  },
  addNotes: {
    id: "addNotes",
    title: "Add Counselor Notes",
    description: "Input form to record call remarks and discussion notes",
    category: "Lead Profile Drawer"
  },
  scheduleFollowup: {
    id: "scheduleFollowup",
    title: "Schedule Follow-Ups",
    description: "Date & time scheduler for future candidate callbacks",
    category: "Lead Profile Drawer"
  }
};

const PermissionsContext = createContext(null);

const STORAGE_KEY = "weekendux_crm_permissions";

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? { ...DEFAULT_PERMISSIONS, ...JSON.parse(cached) } : DEFAULT_PERMISSIONS;
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  });

  const [saving, setSaving] = useState(false);
  const [isFeatureControlOpen, setFeatureControlOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const user = getCrmUser();
  const isAdmin = isCrmAdmin();
  const isCaller = isCrmCaller();

  // Load from backend
  const loadPermissions = useCallback(async () => {
    try {
      const serverPerms = await fetchCrmPermissions();
      if (serverPerms && typeof serverPerms === "object") {
        setPermissions((prev) => {
          const merged = { ...prev, ...serverPerms };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
        setLastUpdated(Date.now());
      }
    } catch (err) {
      console.warn("Failed to load permissions:", err);
    }
  }, []);

  useEffect(() => {
    loadPermissions();
    // Poll permissions every 5 seconds so staff immediately gets changes when admin flips a toggle
    const interval = setInterval(loadPermissions, 5000);
    return () => clearInterval(interval);
  }, [loadPermissions]);

  // Check if current user has access to a feature
  const hasAccess = useCallback(
    (featureKey) => {
      // Admin always has full access to view and use everything
      if (isAdmin) return true;
      // For Caller / Staff, check the permission toggle
      return permissions[featureKey] !== false;
    },
    [isAdmin, permissions]
  );

  // Toggle single permission (Admin only)
  const togglePermission = async (featureKey) => {
    if (!isAdmin) return;
    const currentVal = permissions[featureKey] !== false;
    const newVal = !currentVal;

    const updated = {
      ...permissions,
      [featureKey]: newVal
    };

    // Optimistic UI update
    setPermissions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setSaving(true);
    try {
      await saveCrmPermissions(updated);
    } catch (err) {
      console.error("Failed to persist permission update:", err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle all permissions (Admin only)
  const toggleAll = async (status = true) => {
    if (!isAdmin) return;
    const updated = {};
    Object.keys(DEFAULT_PERMISSIONS).forEach((k) => {
      updated[k] = status;
    });

    setPermissions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    setSaving(true);
    try {
      await saveCrmPermissions(updated);
    } catch (err) {
      console.error("Failed to persist bulk permissions:", err);
    } finally {
      setSaving(false);
    }
  };

  const value = {
    permissions,
    isAdmin,
    isCaller,
    user,
    hasAccess,
    togglePermission,
    toggleAll,
    saving,
    lastUpdated,
    isFeatureControlOpen,
    setFeatureControlOpen,
    refreshPermissions: loadPermissions
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    // Return safe fallback
    const admin = isCrmAdmin();
    return {
      permissions: DEFAULT_PERMISSIONS,
      isAdmin: admin,
      isCaller: isCrmCaller(),
      hasAccess: () => true,
      togglePermission: () => {},
      toggleAll: () => {},
      saving: false,
      isFeatureControlOpen: false,
      setFeatureControlOpen: () => {}
    };
  }
  return context;
}
