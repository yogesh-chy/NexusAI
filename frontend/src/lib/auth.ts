import Cookies from "js-cookie";

const TOKEN_KEY = "rag_pdf_token";

export const setToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: "strict" });
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
