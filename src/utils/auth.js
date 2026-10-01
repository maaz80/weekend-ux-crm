const CRM_TOKEN_STORAGE = "weekendux_crm_token";
const CRM_USER_STORAGE = "weekendux_crm_user";

export const getCrmToken = () => {
  return localStorage.getItem(CRM_TOKEN_STORAGE) || "";
};

export const setCrmToken = (token, user = null) => {
  if (token) {
    localStorage.setItem(CRM_TOKEN_STORAGE, token);
  }
  if (user) {
    localStorage.setItem(CRM_USER_STORAGE, JSON.stringify(user));
  }
};

export const clearCrmToken = () => {
  localStorage.removeItem(CRM_TOKEN_STORAGE);
  localStorage.removeItem(CRM_USER_STORAGE);
};

export const isCrmLoggedIn = () => {
  const token = getCrmToken();
  return Boolean(token);
};

export const getCrmUser = () => {
  try {
    const raw = localStorage.getItem(CRM_USER_STORAGE);
    return raw ? JSON.parse(raw) : { username: "crmadmin", role: "crm_admin" };
  } catch {
    return { username: "crmadmin", role: "crm_admin" };
  }
};
