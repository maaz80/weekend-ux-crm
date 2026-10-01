const API_BASE = import.meta.env.VITE_CRM_API_URL || "http://localhost:5000/api/crm/leads";

export async function fetchLeads(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.append(key, value);
    }
  });

  const res = await fetch(`${API_BASE}?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function fetchAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch CRM analytics");
  return res.json();
}

export async function createNewLead(data) {
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to create lead");
  }
  return res.json();
}

export async function updateLeadStatus(id, payload) {
  const res = await fetch(`${API_BASE}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function addLeadNote(id, payload) {
  const res = await fetch(`${API_BASE}/${id}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to add note");
  return res.json();
}

export async function scheduleLeadFollowUp(id, payload) {
  const res = await fetch(`${API_BASE}/${id}/followup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to schedule follow-up");
  return res.json();
}

export async function updateLeadDetails(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return res.json();
}

export async function triggerLeadSync() {
  const res = await fetch(`${API_BASE}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Failed to sync database leads");
  return res.json();
}

export async function deleteLeadRecord(id) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete lead");
  return res.json();
}
