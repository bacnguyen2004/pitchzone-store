import { useEffect, useState } from "react";

import { createProductReview, getProductReviews } from "../api/reviews";
import { useAuth } from "../contexts/AuthContext";

function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="product-review-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={star <= value ? "is-active" : ""}
          aria-label={`${star} sao`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ProductReviews({ product }) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadReviews() {
    setStatus("loading");
    try {
      const data = await getProductReviews({ productId: product.id });
      setReviews(data);
      setStatus("success");
    } catch {
      setReviews([]);
      setStatus("error");
    }
  }

  useEffect(() => {
    if (product?.id) {
      loadReviews();
    }
  }, [product?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isAuthenticated) {
      setMessage("Đăng nhập để đánh giá sản phẩm.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await createProductReview({
        product_id: product.id,
        rating: form.rating,
        title: form.title,
        comment: form.comment,
      });
      setForm({ rating: 5, title: "", comment: "" });
      setMessage("Cảm ơn bạn đã đánh giá!");
      await loadReviews();
    } catch (err) {
      const detail = err?.response?.data;
      const text =
        typeof detail === "string"
          ? detail
          : detail?.non_field_errors?.[0] ||
            "Không thể gửi đánh giá. Bạn có thể đã đánh giá sản phẩm này.";
      setMessage(text);
    } finally {
      setIsSubmitting(false);
    }
  }

  const average =
    reviews.length > 0
      ? (
          reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <section className="product-detail-desc-panel">
      <div className="product-reviews-head">
        <h2 className="product-detail-section-title">Đánh giá</h2>
        {average && (
          <p className="product-reviews-average">
            {average} ★ · {reviews.length} đánh giá
          </p>
        )}
      </div>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="product-review-form">
          <StarRating
            value={form.rating}
            onChange={(rating) => setForm((current) => ({ ...current, rating }))}
          />
          <input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Tiêu đề (tùy chọn)"
            className="input-field"
          />
          <textarea
            value={form.comment}
            onChange={(event) =>
              setForm((current) => ({ ...current, comment: event.target.value }))
            }
            placeholder="Chia sẻ trải nghiệm của bạn..."
            className="input-field min-h-24 resize-y"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-fit rounded-xl px-5 py-2.5"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </form>
      )}

      {status === "loading" && (
        <p className="text-sm text-slate-500">Đang tải đánh giá...</p>
      )}

      <ul className="product-review-list">
        {reviews.map((review) => (
          <li key={review.id} className="product-review-item">
            <div className="product-review-item-head">
              <strong>{review.username}</strong>
              <StarRating value={review.rating} readOnly />
            </div>
            {review.title && <p className="font-medium">{review.title}</p>}
            <p>{review.comment}</p>
            <time>{new Date(review.created_at).toLocaleDateString("vi-VN")}</time>
          </li>
        ))}
        {status === "success" && reviews.length === 0 && (
          <li className="text-sm text-slate-500">Chưa có đánh giá nào.</li>
        )}
      </ul>
    </section>
  );
}

export default ProductReviews;