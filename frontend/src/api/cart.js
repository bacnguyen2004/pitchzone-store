import api from "./axios";

export async function getCart() {
  const response = await api.get("/cart/");
  return response.data;
}

export async function addCartItem(payload) {
  const response = await api.post("/cart/items/", payload);
  return response.data;
}

export async function updateCartItem(itemId, payload) {
  const response = await api.patch(`/cart/items/${itemId}/`, payload);
  return response.data;
}

export async function deleteCartItem(itemId) {
  await api.delete(`/cart/items/${itemId}/`);
}

