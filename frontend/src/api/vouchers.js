import api from "./axios";

export async function getActiveVouchers() {
  const response = await api.get("/vouchers/");
  return response.data;
}

export async function validateVoucher({ code, subtotal }) {
  const response = await api.post("/vouchers/validate/", { code, subtotal });
  return response.data;
}