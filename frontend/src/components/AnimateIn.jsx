import { useEffect, useRef, useState } from "react";

function AnimateIn({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  once = true,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={`animate-fade-up ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--animate-delay": `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

export default AnimateIn;