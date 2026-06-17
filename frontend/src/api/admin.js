import api from "./axios";
import { buildAdminFormData, payloadHasFile } from "../utils/adminMedia";

export const ADMIN_PAGE_SIZE = 10;

export function normalizePageResponse(data, fallbackPageSize = ADMIN_PAGE_SIZE) {
  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      page: 1,
      totalPages: 1,
      next: null,
      previous: null,
    };
  }

  const count = data.count ?? 0;
  const pageSize = data.page_size || fallbackPageSize;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return {
    results: data.results || [],
    count,
    page: data.page || 1,
    totalPages,
    next: data.next,
    previous: data.previous,
  };
}

function buildListParams(params = {}) {
  const { page = 1, page_size = ADMIN_PAGE_SIZE, search, ...rest } = params;
  const query = { page, page_size, ...rest };

  if (search) {
    query.search = search;
  }

  return query;
}

export async function getAdminDashboard() {
  const response = await api.get("/admin/dashboard/");
  return response.data;
}

export async function getAdminOrders(params = {}) {
  const response = await api.get("/orders/admin/", {
    params: buildListParams(params),
  });
  return response.data;
}

export async function updateAdminOrderStatus(orderId, status) {
  const response = await api.patch(`/orders/${orderId}/status/`, { status });
  return response.data;
}

export async function getAdminProducts(params = {}) {
  const response = await api.get("/products/", {
    params: buildListParams({ ordering: "name", ...params }),
  });
  return response.data;
}

async function sendAdminPayload(method, url, payload) {
  if (payloadHasFile(payload)) {
    const response = await api[method](url, buildAdminFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  const response = await api[method](url, payload);
  return response.data;
}

export async function createAdminProduct(payload) {
  return sendAdminPayload("post", "/products/", payload);
}

export async function updateAdminProduct(productId, payload) {
  return sendAdminPayload("patch", `/products/${productId}/`, payload);
}

export async function deleteAdminProduct(productId) {
  await api.delete(`/products/${productId}/`);
}

export async function getAdminCategories(params = {}) {
  const response = await api.get("/categories/", {
    params: buildListParams({ ordering: "name", ...params }),
  });
  return response.data;
}

export async function createAdminCategory(payload) {
  return sendAdminPayload("post", "/categories/", payload);
}

export async function updateAdminCategory(categoryId, payload) {
  return sendAdminPayload("patch", `/categories/${categoryId}/`, payload);
}

export async function deleteAdminCategory(categoryId) {
  await api.delete(`/categories/${categoryId}/`);
}

export async function getAdminBrands(params = {}) {
  const response = await api.get("/brands/", {
    params: buildListParams({ ordering: "name", ...params }),
  });
  return response.data;
}

export async function createAdminBrand(payload) {
  return sendAdminPayload("post", "/brands/", payload);
}

export async function updateAdminBrand(brandId, payload) {
  return sendAdminPayload("patch", `/brands/${brandId}/`, payload);
}

export async function deleteAdminBrand(brandId) {
  await api.delete(`/brands/${brandId}/`);
}

export async function getAdminUsers(params = {}) {
  const response = await api.get("/admin/users/", {
    params: buildListParams(params),
  });
  return response.data;
}

export async function updateAdminUser(userId, payload) {
  const response = await api.patch(`/admin/users/${userId}/`, payload);
  return response.data;
}

export async function getAdminPromotions(params = {}) {
  const response = await api.get("/admin/promotions/", {
    params: buildListParams(params),
  });
  return response.data;
}

export async function createAdminPromotion(payload) {
  const response = await api.post("/admin/promotions/", payload);
  return response.data;
}

export async function updateAdminPromotion(slug, payload) {
  const response = await api.patch(`/admin/promotions/${slug}/`, payload);
  return response.data;
}

export async function deleteAdminPromotion(slug) {
  await api.delete(`/admin/promotions/${slug}/`);
}

export async function getAdminVouchers(params = {}) {
  const response = await api.get("/admin/vouchers/", {
    params: buildListParams(params),
  });
  return response.data;
}

export async function createAdminVoucher(payload) {
  const response = await api.post("/admin/vouchers/", payload);
  return response.data;
}

export async function updateAdminVoucher(voucherId, payload) {
  const response = await api.patch(`/admin/vouchers/${voucherId}/`, payload);
  return response.data;
}

export async function deleteAdminVoucher(voucherId) {
  await api.delete(`/admin/vouchers/${voucherId}/`);
}

export async function getAdminVariants(params = {}) {
  const response = await api.get("/variants/", {
    params: buildListParams(params),
  });
  return response.data;
}

export async function updateAdminVariant(variantId, payload) {
  const response = await api.patch(`/variants/${variantId}/`, payload);
  return response.data;
}