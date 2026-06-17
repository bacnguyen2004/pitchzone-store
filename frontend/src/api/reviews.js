import api from "./axios";

export async function getProductReviews({ productId, productSlug }) {
  const response = await api.get("/reviews/", {
    params: {
      ...(productId ? { product: productId } : {}),
      ...(productSlug ? { product__slug: productSlug } : {}),
    },
  });
  return response.data.results || response.data;
}

export async function createProductReview(payload) {
  const response = await api.post("/reviews/", payload);
  return response.data;
}