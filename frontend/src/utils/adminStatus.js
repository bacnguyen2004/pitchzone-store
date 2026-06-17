export function isWithinDateRange(startsAt, endsAt, now = new Date()) {
  const starts = new Date(startsAt);
  const ends = new Date(endsAt);

  if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) {
    return false;
  }

  return starts <= now && now <= ends;
}

export function getCampaignStatus(item) {
  if (!item?.is_active) {
    return { label: "Tắt", tone: "inactive" };
  }

  const now = new Date();

  if (new Date(item.starts_at) > now) {
    return { label: "Sắp diễn ra", tone: "pending" };
  }

  if (new Date(item.ends_at) < now) {
    return { label: "Đã hết hạn", tone: "cancelled" };
  }

  return { label: "Đang chạy", tone: "active" };
}