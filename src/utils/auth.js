const CRM_TOKEN_STORAGE = "weekendux_crm_token";
const CRM_USER_STORAGE = "weekendux_crm_user";
const ADMIN_TOKEN_STORAGE = "weekendux_admin_token";

export const getCrmToken = () => {
  return (
    localStorage.getItem(CRM_TOKEN_STORAGE) ||
    localStorage.getItem(ADMIN_TOKEN_STORAGE) ||
    ""
  );
};

export const setCrmToken = (token, user = null) => {
  if (token) {
    localStorage.setItem(CRM_TOKEN_STORAGE, token);
    localStorage.setItem(ADMIN_TOKEN_STORAGE, token); // compatibility with admin
  }
  if (user) {
    localStorage.setItem(CRM_USER_STORAGE, JSON.stringify(user));
  }
};

export const clearCrmToken = () => {
  localStorage.removeItem(CRM_TOKEN_STORAGE);
  localStorage.removeItem(CRM_USER_STORAGE);
  localStorage.removeItem(ADMIN_TOKEN_STORAGE);
};

export const isCrmLoggedIn = () => {
  const token = getCrmToken();
  return Boolean(token);
};

export const getCrmUser = () => {
  try {
    const raw = localStorage.getItem(CRM_USER_STORAGE);
    return raw ? JSON.parse(raw) : { username: "Admin", role: "Administrator" };
  } catch {
    return { username: "Admin", role: "Administrator" };
  }
};
