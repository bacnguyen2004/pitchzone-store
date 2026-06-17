import { useState } from "react";

import { EyeIcon, EyeOffIcon } from "./AuthIcons";

function AuthField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  minLength,
  icon,
  required = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const paddingClass = [
    icon ? "pl-11" : "pl-4",
    isPassword ? "pr-11" : "pr-4",
  ].join(" ");

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <div className="relative mt-2">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            {icon}
          </span>
        )}
        <input
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          required={required}
          className={`input-field py-2.5 ${paddingClass}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </label>
  );
}

export default AuthField;