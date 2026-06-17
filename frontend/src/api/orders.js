import api from "./axios";

export async function checkoutOrder(payload) {
  const response = await api.post("/orders/checkout/", {
    full_name: payload.full_name,
    phone: payload.phone,
    address: payload.address,
    note: payload.note || "",
    voucher_code: payload.voucher_code || "",
  });
  return response.data;
}

export async function getOrders() {
  const response = await api.get("/orders/");
  return response.data.results || response.data;
}

export async function getOrder(id) {
  const response = await api.get(`/orders/${id}/`);
  return response.data;
}
