import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { verifyVNPayReturn } from "../api/orders";
import { CheckIcon } from "../components/AuthIcons";
import { usePageTitle } from "../hooks/usePageTitle";

function VNPayReturnPage() {
  usePageTitle("Kết quả thanh toán VNPay");
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    async function verify() {
      const redirectOrderId = searchParams.get("order_id");
      const redirectStatus = searchParams.get("status");
      const txnRef = searchParams.get("txn_ref") || searchParams.get("vnp_TxnRef");

      if (redirectOrderId) {
        setOrderId(Number(redirectOrderId));
      }

      if (!searchParams.get("vnp_SecureHash") && redirectStatus) {
        setStatus(redirectStatus === "success" ? "success" : "failed");
        if (!redirectOrderId && txnRef) {
          try {
            const data = await verifyVNPayReturn({ txn_ref: txnRef });
            if (data.order?.id) {
              setOrderId(data.order.id);
            }
          } catch {
            // keep redirect status
          }
        }
        return;
      }

      try {
        const params = Object.fromEntries(searchParams.entries());
        const data = await verifyVNPayReturn(params);
        setStatus(data.success ? "success" : "failed");
        setOrderId(data.order?.id || redirectOrderId || null);
      } catch {
        setStatus(redirectStatus === "success" ? "success" : "failed");
      }
    }

    verify();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <main className="cart-page">
        <div className="page-container py-14 text-center">
          <p className="text-slate-500">Đang xác nhận thanh toán...</p>
        </div>
      </main>
    );
  }

  const isSuccess = status === "success";

  return (
    <main className="cart-page">
      <div className="page-container py-14">
        <div className="order-success-card">
          <span className={`order-success-icon${isSuccess ? "" : " !bg-red-100 !text-red-700"}`}>
            {isSuccess ? <CheckIcon className="h-8 w-8" /> : "!"}
          </span>
          <h1>{isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}</h1>
          <p>
            {isSuccess
              ? "VNPay đã xác nhận thanh toán. Đơn hàng sẽ được xử lý sớm."
              : "Giao dịch không thành công hoặc đã bị hủy."}
          </p>
          <div className="order-success-actions">
            {isSuccess && orderId && (
              <Link to={`/orders/${orderId}`} className="btn-primary rounded-xl px-6 py-3">
                Xem đơn hàng
              </Link>
            )}
            <Link to="/orders" className="btn-secondary rounded-xl px-6 py-3">
              Danh sách đơn
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default VNPayReturnPage;
