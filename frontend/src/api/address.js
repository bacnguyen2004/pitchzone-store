const ADDRESS_API_BASE = "https://provinces.open-api.vn/api/v2";

async function fetchAddressJson(path) {
  const response = await fetch(`${ADDRESS_API_BASE}${path}`);

  if (!response.ok) {
    throw new Error("Không tải được dữ liệu địa chỉ.");
  }

  return response.json();
}

export async function getProvinces() {
  return fetchAddressJson("/");
}

export async function getWards(provinceCode) {
  const data = await fetchAddressJson(`/p/${provinceCode}?depth=2`);
  return data.wards || [];
}

export function formatFullAddress({ street, wardName, provinceName }) {
  const parts = [street, wardName, provinceName].filter(Boolean);
  return parts.join(", ");
}

export function isAddressComplete({ street, provinceCode, wardCode }) {
  return Boolean(street?.trim() && provinceCode && wardCode);
}