import api from "./axios";

export async function checkoutOrder(payload) {
  const response = await api.post("/orders/checkout/", payload);
  return response.data;
}

export async function getOrders() {
  const response = await api.get("/orders/");
  return response.data.results || response.data;
}

