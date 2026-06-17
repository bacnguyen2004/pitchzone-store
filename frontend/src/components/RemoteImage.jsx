import { useState } from "react";

function RemoteImage({
  src,
  alt = "",
  className = "",
  fallbackClassName = "h-full w-full bg-gradient-to-br from-slate-700 to-slate-900",
  loading = "lazy",
  decoding = "async",
  style,
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <div className={fallbackClassName} aria-hidden />;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={className}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}

export default RemoteImage;