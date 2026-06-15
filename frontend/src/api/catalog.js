import api from "./axios";

export async function getProducts(params = {}) {
  const response = await api.get("/products/", { params });
  return response.data;
}

export async function getProduct(id) {
  const response = await api.get(`/products/${id}/`);
  return response.data;
}

export async function getCategories() {
  const response = await api.get("/categories/");
  return response.data.results || response.data;
}

export async function getBrands() {
  const response = await api.get("/brands/");
  return response.data.results || response.data;
}

