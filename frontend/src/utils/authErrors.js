const FIELD_LABELS = {
  username: "Tên đăng nhập",
  email: "Email",
  password: "Mật khẩu",
  current_password: "Mật khẩu hiện tại",
  new_password: "Mật khẩu mới",
  non_field_errors: "Lỗi chung",
};

const ERROR_TRANSLATIONS = [
  {
    match: /user with that username already exists/i,
    text: "Tên đăng nhập này đã được sử dụng.",
  },
  {
    match: /valid email/i,
    text: "Email không hợp lệ.",
  },
  {
    match: /at least 8 characters/i,
    text: "Mật khẩu phải có ít nhất 8 ký tự.",
  },
  {
    match: /no active account/i,
    text: "Tên đăng nhập hoặc mật khẩu không đúng.",
  },
];

function translateMessage(message) {
  const text = String(message);
  const matched = ERROR_TRANSLATIONS.find((item) => item.match.test(text));
  return matched?.text || text;
}

function normalizeMessages(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map(translateMessage);
  }

  return [translateMessage(value)];
}

export function parseRegisterError(error) {
  const data = error?.response?.data;

  if (!data) {
    return {
      title: "Không thể tạo tài khoản",
      messages: ["Đã xảy ra lỗi. Vui lòng thử lại sau."],
    };
  }

  if (typeof data === "string") {
    return {
      title: "Không thể tạo tài khoản",
      messages: [translateMessage(data)],
    };
  }

  if (data.detail) {
    return {
      title: "Không thể tạo tài khoản",
      messages: normalizeMessages(data.detail),
    };
  }

  const messages = Object.entries(data).flatMap(([field, value]) => {
    const label = FIELD_LABELS[field] || field;
    return normalizeMessages(value).map((message) => `${label}: ${message}`);
  });

  return {
    title: "Không thể tạo tài khoản",
    messages: messages.length
      ? messages
      : ["Tên đăng nhập có thể đã tồn tại. Vui lòng thử tên khác."],
  };
}

export function getLoginError() {
  return {
    title: "Đăng nhập thất bại",
    messages: [
      "Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.",
    ],
  };
}

export function getPasswordMismatchError() {
  return {
    title: "Mật khẩu chưa khớp",
    messages: ["Mật khẩu xác nhận phải trùng với mật khẩu bạn vừa nhập."],
  };
}

export function parseProfileError(error) {
  const data = error?.response?.data;

  if (!data) {
    return {
      title: "Không thể cập nhật",
      messages: ["Đã xảy ra lỗi. Vui lòng thử lại sau."],
    };
  }

  if (typeof data === "string") {
    return {
      title: "Không thể cập nhật",
      messages: [translateMessage(data)],
    };
  }

  if (data.detail) {
    return {
      title: "Không thể cập nhật",
      messages: normalizeMessages(data.detail),
    };
  }

  const messages = Object.entries(data).flatMap(([field, value]) => {
    const label = FIELD_LABELS[field] || field;
    return normalizeMessages(value).map((message) => `${label}: ${message}`);
  });

  return {
    title: "Không thể cập nhật",
    messages: messages.length
      ? messages
      : ["Thông tin không hợp lệ. Vui lòng kiểm tra lại."],
  };
}