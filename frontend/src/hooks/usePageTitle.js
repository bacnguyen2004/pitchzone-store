import { useEffect } from "react";

const SITE_NAME = "PitchZone";

export function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
    return () => {
      document.title = previous;
    };
  }, [title]);
}