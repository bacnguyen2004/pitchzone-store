import { getMainImage, resolveMediaUrl } from "./format";

export function getAdminImageUrl(entity) {
  if (!entity) {
    return "";
  }

  if (entity.main_image) {
    return resolveMediaUrl(entity.main_image);
  }

  if (entity.image) {
    return resolveMediaUrl(entity.image);
  }

  const mainImage = getMainImage(entity);
  if (mainImage?.image) {
    return resolveMediaUrl(mainImage.image);
  }

  return "";
}

export function buildAdminFormData(payload = {}) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
      return;
    }

    if (value === "") {
      return;
    }

    formData.append(key, value);
  });

  return formData;
}

export function payloadHasFile(payload = {}) {
  return Object.values(payload).some((value) => value instanceof File);
}