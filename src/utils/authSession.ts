export type AuthSession = {
  schoolCode: string;
  role: string;
  userName: string;
  email: string;
  token: string;
};

const SESSION_KEY = "smsAuthSession";

export const getAuthSession = (): AuthSession | null => {
  try {
    const rawSession = sessionStorage.getItem(SESSION_KEY);
    if (!rawSession) {
      return null;
    }

    const parsed = JSON.parse(rawSession);
    const email = String(parsed?.email ?? "")
      .trim()
      .toLowerCase();

    return {
      schoolCode: String(parsed?.schoolCode ?? "")
        .trim()
        .toUpperCase(),
      role: String(parsed?.role ?? "")
        .trim()
        .toUpperCase(),
      userName: email.split("@")[0] || "",
      email,
      token: String(parsed?.token ?? "").trim(),
    };
  } catch {
    return null;
  }
};

export const getAuthToken = (): string => getAuthSession()?.token ?? "";

export const clearAuthSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};
