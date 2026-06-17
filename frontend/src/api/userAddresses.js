import api from "./axios";

export async function getUserAddresses() {
  const response = await api.get("/auth/addresses/");
  return response.data.results || response.data;
}

export async function createUserAddress(payload) {
  const response = await api.post("/auth/addresses/", payload);
  return response.data;
}

export async function updateUserAddress(addressId, payload) {
  const response = await api.patch(`/auth/addresses/${addressId}/`, payload);
  return response.data;
}

export async function deleteUserAddress(addressId) {
  await api.delete(`/auth/addresses/${addressId}/`);
}