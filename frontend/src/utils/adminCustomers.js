export function deriveCustomersFromOrders(orders) {
  const map = new Map();

  for (const order of orders) {
    const key = order.phone || order.full_name;
    const total = Number(order.total_price || 0);

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: order.full_name,
        phone: order.phone,
        address: order.address,
        orderCount: 1,
        lastOrderAt: order.created_at,
        totalSpent: total,
      });
      continue;
    }

    const existing = map.get(key);
    existing.orderCount += 1;
    existing.totalSpent += total;

    if (order.created_at > existing.lastOrderAt) {
      existing.lastOrderAt = order.created_at;
      existing.address = order.address;
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    b.lastOrderAt.localeCompare(a.lastOrderAt),
  );
}