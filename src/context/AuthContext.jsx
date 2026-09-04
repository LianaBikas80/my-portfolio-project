import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const CURRENT_USER_KEY = "auth_current_user";
const TOKEN_KEY = "auth_token";

const API_URL = "http://localhost:5000/api/auth";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem(CURRENT_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY) || null;
  });

  const isAuthenticated = Boolean(currentUser && token);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          code: "REGISTER_FAILED",
          message: data.message || "ثبت‌نام ناموفق بود.",
        };
      }

      setCurrentUser(data.user);
      setToken(data.token);

      return {
        success: true,
        code: "REGISTER_SUCCESS",
        user: data.user,
      };
    } catch {
      return {
        success: false,
        code: "NETWORK_ERROR",
        message: "اتصال به سرور برقرار نشد.",
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          code: "LOGIN_FAILED",
          message: data.message || "ایمیل یا رمز عبور اشتباه است.",
        };
      }

      setCurrentUser(data.user);
      setToken(data.token);

      return {
        success: true,
        code: "LOGIN_SUCCESS",
        user: data.user,
      };
    } catch {
      return {
        success: false,
        code: "NETWORK_ERROR",
        message: "اتصال به سرور برقرار نشد.",
      };
    }
  };

  // const resetPassword = async () => {
  //   return {
  //     success: false,
  //     code: "NOT_IMPLEMENTED",
  //     message: "بازیابی رمز عبور هنوز در بک‌اند پیاده‌سازی نشده است.",
  //   };
  // };

  // const logout = () => {
  //   setCurrentUser(null);
  //   setToken(null);
  // };

  // const value = {
  //   currentUser,
  //   token,
  //   isAuthenticated,
  //   login,
  //   register,
  //   resetPassword,
  //   logout,
  // };


   const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          code: data.code || "FORGOT_PASSWORD_FAILED",
          message: data.message || "خطا در ارسال کد تأیید.",
        };
      }

      return {
        success: true,
        code: "CODE_SENT_SUCCESS",
        message: data.message,
      };
    } catch {
      return {
        success: false,
        code: "NETWORK_ERROR",
        message: "اتصال به سرور برقرار نشد.",
      };
    }
  };
    const verifyResetCode = async (email, code) => {
    try {
      const response = await fetch(`${API_URL}/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          code: data.code || "INVALID_CODE",
          message: data.message || "کد تأیید نادرست است یا منقضی شده است.",
        };
      }

      return {
        success: true,
        code: "CODE_VERIFIED",
        message: data.message,
      };
    } catch {
      return {
        success: false,
        code: "NETWORK_ERROR",
        message: "اتصال به سرور برقرار نشد.",
      };
    }
  };
  const resetPassword = async (email, code, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          code: data.code || "RESET_PASSWORD_FAILED",
          message: data.message || "کد تأیید نادرست است یا منقضی شده است.",
        };
      }

      return {
        success: true,
        code: "RESET_SUCCESS",
        message: data.message,
      };
    } catch {
      return {
        success: false,
        code: "NETWORK_ERROR",
        message: "اتصال به سرور برقرار نشد.",
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
  };

  const value = {
    currentUser,
    token,
    isAuthenticated,
    login,
    register,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth باید داخل AuthProvider استفاده شود");
  }

  return context;
};