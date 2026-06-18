import { useEffect } from "react";

import { getAppName } from "../config/env";

const SITE_NAME = getAppName();

export function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    return () => {
      document.title = previous;
    };
  }, [title]);
}