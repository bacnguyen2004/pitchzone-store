function normalizeMessage(value) {
  if (value == null) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(" ");
  }

  return String(value);
}

export function getApiErrorMessage(error, fallback = "Có lỗi xảy ra.") {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || fallback;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data.detail != null) {
    const detail = normalizeMessage(data.detail);
    if (detail) {
      return detail;
    }
  }

  if (typeof data === "object") {
    const preferredKeys = ["voucher_code", "code", "non_field_errors"];
    for (const key of preferredKeys) {
      if (data[key] != null) {
        const message = normalizeMessage(data[key]);
        if (message) {
          return message;
        }
      }
    }

    for (const value of Object.values(data)) {
      const message = normalizeMessage(value);
      if (message) {
        return message;
      }
    }
  }

  return fallback;
}