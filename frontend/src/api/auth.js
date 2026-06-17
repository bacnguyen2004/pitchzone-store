import api from "./axios";

export async function registerUser(payload) {
  const response = await api.post("/auth/register/", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await api.post("/auth/login/", payload);
  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me/");
  return response.data;
}

export async function updateCurrentUser(payload) {
  const response = await api.patch("/auth/me/", payload);
  return response.data;
}

export async function changePassword(payload) {
  const response = await api.post("/auth/change-password/", payload);
  return response.data;
}