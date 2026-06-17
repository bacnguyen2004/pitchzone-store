import { useCallback, useEffect, useState } from "react";

import { getCart } from "../api/cart";
import { useAuth } from "../contexts/AuthContext";

export function useCartCount() {
  const { isAuthenticated } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }

    try {
      const cart = await getCart();
      setCount(cart?.total_items || 0);
    } catch {
      setCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    function handleCartUpdated() {
      refresh();
    }

    window.addEventListener("cart:updated", handleCartUpdated);
    return () => window.removeEventListener("cart:updated", handleCartUpdated);
  }, [refresh]);

  return { count, refresh };
}

export function notifyCartUpdated() {
  window.dispatchEvent(new Event("cart:updated"));
}