export function getApiErrorMessage(error, fallback = "Có lỗi xảy ra.") {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (data && typeof data === "object") {
    const values = Object.values(data).flat();
    const first = values.find((item) => typeof item === "string");

    if (first) {
      return first;
    }
  }

  return fallback;
}