import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { adminOrderStatus } from "../../config/adminContent";
import { formatCurrency } from "../../utils/format";

const STATUS_COLORS = {
  pending: "#f59e0b",
  processing: "#0ea5e9",
  shipping: "#6366f1",
  completed: "#10b981",
  cancelled: "#94a3b8",
};

const PAYMENT_COLORS = {
  cod: "#10b981",
  vnpay: "#3b82f6",
};

const PAYMENT_LABELS = {
  cod: "COD",
  vnpay: "VNPay",
};

const PAYMENT_STATUS_LABELS = {
  unpaid: "Chưa thanh toán",
  pending: "Chờ xác nhận",
  paid: "Đã thanh toán",
  failed: "Thất bại",
};

const PAYMENT_STATUS_COLORS = ["#f59e0b", "#0ea5e9", "#10b981", "#ef4444"];

function ChartTooltipCurrency({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="admin-chart-tooltip">
      <p className="admin-chart-tooltip-label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}:{" "}
          {entry.dataKey === "orders"
            ? entry.value
            : formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

function ChartTooltipCount({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="admin-chart-tooltip">
      <p className="admin-chart-tooltip-label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function formatCompactCurrency(value) {
  const num = Number(value || 0);
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${Math.round(num / 1_000)}K`;
  }
  return String(num);
}

export function AdminRevenueTrendChart({ data }) {
  const chartData = data || [];

  return (
    <div className="admin-chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactCurrency}
            width={48}
          />
          <Tooltip content={<ChartTooltipCurrency />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Doanh thu"
            stroke="#059669"
            strokeWidth={2.5}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminOrdersTrendChart({ data }) {
  const chartData = data || [];

  return (
    <div className="admin-chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip content={<ChartTooltipCount />} />
          <Bar
            dataKey="orders"
            name="Đơn hàng"
            fill="#3b82f6"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminCombinedTrendChart({ data }) {
  const chartData = data || [];

  return (
    <div className="admin-chart-wrap is-tall">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="comboRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            yAxisId="revenue"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactCurrency}
            width={48}
          />
          <YAxis
            yAxisId="orders"
            orientation="right"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip content={<ChartTooltipCurrency />} />
          <Legend
            verticalAlign="top"
            height={28}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            name="Doanh thu"
            stroke="#059669"
            strokeWidth={2}
            fill="url(#comboRevenue)"
          />
          <Bar
            yAxisId="orders"
            dataKey="orders"
            name="Đơn hàng"
            fill="#93c5fd"
            radius={[4, 4, 0, 0]}
            maxBarSize={16}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminStatusDonutChart({ statusCounts }) {
  const data = (statusCounts || [])
    .map((item) => ({
      name: adminOrderStatus[item.status]?.label || item.status,
      value: item.count,
      key: item.status,
    }))
    .filter((item) => item.value > 0);

  if (data.length === 0) {
    return <p className="admin-empty">Chưa có dữ liệu trạng thái.</p>;
  }

  return (
    <div className="admin-chart-wrap is-donut">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={STATUS_COLORS[entry.key] || "#cbd5e1"}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipCount />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminPaymentDonutChart({ paymentMethods }) {
  const data = (paymentMethods || [])
    .map((item) => ({
      name: PAYMENT_LABELS[item.payment_method] || item.payment_method,
      value: item.count,
      key: item.payment_method,
    }))
    .filter((item) => item.value > 0);

  if (data.length === 0) {
    return <p className="admin-empty">Chưa có dữ liệu thanh toán.</p>;
  }

  return (
    <div className="admin-chart-wrap is-donut">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={PAYMENT_COLORS[entry.key] || "#6366f1"}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipCount />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminPaymentStatusChart({ paymentStatusCounts }) {
  const data = (paymentStatusCounts || [])
    .map((item) => ({
      name:
        PAYMENT_STATUS_LABELS[item.payment_status] || item.payment_status,
      value: item.count,
    }))
    .filter((item) => item.value > 0);

  if (data.length === 0) {
    return <p className="admin-empty">Chưa có dữ liệu.</p>;
  }

  return (
    <div className="admin-chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<ChartTooltipCount />} />
          <Bar dataKey="value" name="Đơn" radius={[0, 6, 6, 0]} maxBarSize={18}>
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={PAYMENT_STATUS_COLORS[index % PAYMENT_STATUS_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminTopProductsChart({ topProducts }) {
  const data = (topProducts || []).map((item) => ({
    name:
      item.product_name.length > 22
        ? `${item.product_name.slice(0, 22)}…`
        : item.product_name,
    revenue: Number(item.revenue || 0),
    quantity: Number(item.quantity || 0),
  }));

  if (data.length === 0) {
    return <p className="admin-empty">Chưa có dữ liệu bán hàng.</p>;
  }

  return (
    <div className="admin-chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={formatCompactCurrency}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip content={<ChartTooltipCurrency />} />
          <Bar
            dataKey="revenue"
            name="Doanh thu"
            fill="#8b5cf6"
            radius={[0, 6, 6, 0]}
            maxBarSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AdminCategorySalesChart({ categorySales }) {
  const data = (categorySales || []).map((item) => ({
    name: item.name,
    revenue: Number(item.revenue || 0),
    quantity: Number(item.quantity || 0),
  }));

  if (data.length === 0) {
    return <p className="admin-empty">Chưa có dữ liệu danh mục.</p>;
  }

  return (
    <div className="admin-chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={formatCompactCurrency}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip content={<ChartTooltipCurrency />} />
          <Bar
            dataKey="revenue"
            name="Doanh thu"
            fill="#f59e0b"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}