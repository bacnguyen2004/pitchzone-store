import api from "./axios";

export async function getShippingQuote({
  subtotal,
  city = "",
  item_count = 1,
}) {
  const response = await api.get("/orders/shipping-quote/", {
    params: { subtotal, city, item_count },
  });
  return response.data;
}

export async function verifyVNPayReturn(params) {
  const response = await api.get("/payments/vnpay/verify/", { params });
  return response.data;
}

export async function checkoutOrder(payload) {
  const response = await api.post("/orders/checkout/", {
    full_name: payload.full_name,
    phone: payload.phone,
    address: payload.address,
    city: payload.city || "",
    note: payload.note || "",
    payment_method: payload.payment_method || "cod",
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

export async function cancelOrder(id) {
  const response = await api.post(`/orders/${id}/cancel/`);
  return response.data;
}