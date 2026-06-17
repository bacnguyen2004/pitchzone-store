import { useCallback, useEffect, useState } from "react";

import { ADMIN_PAGE_SIZE, normalizePageResponse } from "../api/admin";

export function useAdminList({
  fetcher,
  initialPageSize = ADMIN_PAGE_SIZE,
  extraParams = {},
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const extraKey = JSON.stringify(extraParams);

  useEffect(() => {
    setPage(1);
  }, [extraKey]);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setStatus("loading");
    }
    setError("");

    try {
      const data = await fetcher({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        ...extraParams,
      });

      const normalized = normalizePageResponse(data, pageSize);

      setItems(normalized.results);
      setCount(normalized.count);
      setTotalPages(normalized.totalPages);
      setStatus("success");
    } catch {
      setError("Không tải được dữ liệu.");
      setStatus("error");
    }
  }, [fetcher, page, pageSize, search, extraKey]);

  useEffect(() => {
    const delay = search ? 300 : 0;
    const timer = window.setTimeout(load, delay);
    return () => window.clearTimeout(timer);
  }, [load]);

  function handleSearchChange(value) {
    setSearch(value);
    setPage(1);
  }

  function handlePageChange(nextPage) {
    setPage(Math.max(1, nextPage));
  }

  function handlePageSizeChange(nextPageSize) {
    setPageSize(nextPageSize);
    setPage(1);
  }

  return {
    items,
    page,
    pageSize,
    count,
    totalPages,
    search,
    status,
    error,
    setError,
    load,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
  };
}