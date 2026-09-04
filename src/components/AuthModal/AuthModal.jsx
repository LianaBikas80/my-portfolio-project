import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useLanguage } from "../../context/LanguageContext";

const AUTH_TOAST_ID = "auth-toast";

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, resetPassword,forgotPassword ,verifyResetCode } = useAuth();
  const { t, lang } = useLanguage();
  const isRTL = lang === "fa";

  const switchMode = (nextMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setName("");
    setPassword("");
    setShowPassword(false);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const validatePassword = (value) => {
    if (value.length < 8) return t("authModal.errors.passwordLength");
    if (!/[a-z]/.test(value)) return t("authModal.errors.passwordLowercase");
    if (!/[A-Z]/.test(value)) return t("authModal.errors.passwordUppercase");
    if (!/[0-9]/.test(value)) return t("authModal.errors.passwordNumber");
    return null;
  };

  // تابع اصلاح‌شده برای بازگرداندن متن تمیز بدون کدهای سیستمی
  const getAuthMessage = (code, fallbackKey) => {
    if (code && t(`authModal.messages.${code}`) !== `authModal.messages.${code}`) {
      return t(`authModal.messages.${code}`);
    }
    return t(fallbackKey);
  };

 

  const handleForgotPassword = async () => {
    const isDarkMode = document.documentElement.classList.contains("dark");

    const swalTheme = {
      background: isDarkMode ? "#1e293b" : "#ffffff",
      color: isDarkMode ? "#f1f5f9" : "#0f172a",
      buttonsStyling: false,
      customClass: {
        popup:
          "rounded-2xl border border-slate-200 p-6 shadow-2xl dark:border-slate-700",
        title:
          "mb-2 text-xl font-bold text-slate-800 dark:text-slate-100",
        htmlContainer:
          "mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400",
        input:
          "!box-border !w-full !mx-0 sm:!max-w-[400px] sm:!mx-auto !rounded-xl !border !border-slate-200 !bg-slate-50 !px-4 !py-3 !text-slate-900 placeholder:!text-slate-400 focus:!border-sky-500 focus:!ring-2 focus:!ring-sky-500/20 dark:!border-slate-600 dark:!bg-slate-700 dark:!text-white dark:placeholder:!text-slate-400",
        actions: "mt-6 w-full gap-3",
        confirmButton:
          "inline-flex min-w-28 items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800",
        cancelButton:
          "inline-flex min-w-28 items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus-visible:ring-offset-slate-800",
        validationMessage:
          "!mx-0 !mt-3 !rounded-lg !border !border-rose-200 !bg-rose-50 !px-3 !py-2 !text-sm !font-medium !text-rose-600 dark:!border-rose-900/60 dark:!bg-rose-950/40 dark:!text-rose-300",
      },
    };

    // مرحله ۱: دریافت ایمیل
    const { value: targetEmail } = await Swal.fire({
      ...swalTheme,
      title: t("authModal.forgotPassword.title"),
      text: t("authModal.forgotPassword.desc"),
      input: "email",
      inputValue: email,
      inputPlaceholder: t("authModal.placeholders.email"),
      showCancelButton: true,
      confirmButtonText: t("authModal.forgotPassword.confirmBtn"),
      cancelButtonText: t("authModal.forgotPassword.cancelBtn"),
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return t("authModal.errors.emailRequired");
        }
        if (!isValidEmail(value)) {
          return t("authModal.errors.emailInvalid");
        }
        return null;
      },
    });

    if (!targetEmail) return;

    // ارسال درخواست کد به بک‌اند
    Swal.fire({
      ...swalTheme,
      title: t("authModal.buttons.submitting"),
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const sendCodeRes = await forgotPassword(targetEmail.trim());

    if (!sendCodeRes.success) {
      Swal.fire({
        ...swalTheme,
        icon: "error",
        iconColor: "#e11d48",
        title: t("authModal.forgotPassword.errorTitle"),
        text: getAuthMessage(sendCodeRes.code, "authModal.messages.USER_NOT_FOUND"),
        confirmButtonText: t("authModal.forgotPassword.confirmBtn"),
        customClass: {
          ...swalTheme.customClass,
          icon: "!border-rose-500 !text-rose-600 dark:!border-rose-400 dark:!text-rose-400",
        },
      });
      return;
    }

    // مرحله ۲: دریافت کد ۶ رقمی
     
     let otpInterval = null;
    let currentTimer = 30;

    const emailBadge = `<span class="font-semibold text-slate-700 dark:text-slate-200">${targetEmail}</span>`;

    const { value: resetCode } = await Swal.fire({
      ...swalTheme,
      title: t("authModal.forgotPassword.otpTitle"),
      html: `
        <p class="mb-3 text-sm text-slate-500 dark:text-slate-400">
          ${t("authModal.forgotPassword.otpPrompt", { email: emailBadge })}
        </p>
        <input
          id="swal-otp-input"
          type="text"
          maxlength="6"
          placeholder="${t("authModal.forgotPassword.otpPlaceholder")}"
          class="w-full text-center tracking-widest text-lg font-bold rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
        <div class="mt-4 flex items-center justify-center text-sm">
          <span id="otp-timer-text" class="text-slate-500 dark:text-slate-400">
            ${t("authModal.forgotPassword.otpTimerPrefix")} <span id="otp-countdown" class="font-bold text-sky-600 dark:text-sky-400">30</span> ${t("authModal.forgotPassword.otpTimerSuffix")}
          </span>
          <button
            id="otp-resend-btn"
            type="button"
            class="hidden cursor-pointer font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
          >
            ${t("authModal.forgotPassword.otpResendBtn")}
          </button>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: t("authModal.forgotPassword.otpVerifyBtn"),
      cancelButtonText: t("authModal.forgotPassword.cancelBtn"),
      didOpen: () => {
        const input = document.getElementById("swal-otp-input");
        const countdownEl = document.getElementById("otp-countdown");
        const timerTextEl = document.getElementById("otp-timer-text");
        const resendBtn = document.getElementById("otp-resend-btn");

        if (input) {
          input.focus();
          // به محض تایپ کردن، پیام خطای قبلی پاک می‌شود
          input.addEventListener("input", () => {
            Swal.resetValidationMessage();
          });
        }

        const startTimer = () => {
          currentTimer = 30;
          if (countdownEl) countdownEl.textContent = currentTimer;
          if (timerTextEl) timerTextEl.classList.remove("hidden");
          if (resendBtn) resendBtn.classList.add("hidden");

          if (otpInterval) clearInterval(otpInterval);

          otpInterval = setInterval(() => {
            currentTimer -= 1;
            if (countdownEl) {
              countdownEl.textContent = currentTimer < 10 ? `0${currentTimer}` : currentTimer;
            }

            if (currentTimer <= 0) {
              clearInterval(otpInterval);
              if (timerTextEl) timerTextEl.classList.add("hidden");
              if (resendBtn) resendBtn.classList.remove("hidden");
            }
          }, 1000);
        };

        startTimer();

        if (resendBtn) {
          resendBtn.addEventListener("click", async () => {
            resendBtn.disabled = true;
            resendBtn.textContent = t("authModal.forgotPassword.otpResending");

            try {
              const res = await forgotPassword(targetEmail.trim());
              if (res.success) {
                toast.success(t("authModal.forgotPassword.otpResendSuccess"), { toastId: AUTH_TOAST_ID });
                startTimer();
              } else {
                toast.error(getAuthMessage(res.code, "authModal.messages.UNKNOWN_ERROR"), {
                  toastId: AUTH_TOAST_ID,
                });
              }
            } catch (err) {
              toast.error(t("authModal.forgotPassword.otpNetworkErr"), { toastId: AUTH_TOAST_ID });
            } finally {
              resendBtn.disabled = false;
              resendBtn.textContent = t("authModal.forgotPassword.otpResendBtn");
            }
          });
        }
      },
      willClose: () => {
        if (otpInterval) {
          clearInterval(otpInterval);
        }
      },
      // preConfirm: () => {
      //   const input = document.getElementById("swal-otp-input");
      //   const value = input ? input.value.trim() : "";

      //   if (!value) {
      //     Swal.showValidationMessage(t("authModal.forgotPassword.otpErrEmpty"));
      //     return false;
      //   }
      //   if (value.length !== 6) {
      //     Swal.showValidationMessage(t("authModal.forgotPassword.otpErrLength"));
      //     return false;
      //   }
      //   return value;
      // },
       preConfirm: async () => {
        const input = document.getElementById("swal-otp-input");
        const value = input ? input.value.trim() : "";

        if (!value) {
          Swal.showValidationMessage(t("authModal.forgotPassword.otpErrEmpty"));
          return false;
        }
        if (value.length !== 6) {
          Swal.showValidationMessage(t("authModal.forgotPassword.otpErrLength"));
          return false;
        }

        // بررسی صحت کد از طریق بک‌اند
        const verifyRes = await verifyResetCode(targetEmail.trim(), value);
        if (!verifyRes.success) {
          Swal.showValidationMessage(
            getAuthMessage(verifyRes.code, "authModal.forgotPassword.otpErrInvalid")
          );
          return false;
        }

        return value;
      },
    });

    if (!resetCode) return;

    // مرحله ۳: دریافت رمز عبور جدید
    const { value: newPassword } = await Swal.fire({
      ...swalTheme,
      title: t("authModal.forgotPassword.newPasswordTitle"),
      text: t("authModal.forgotPassword.newPasswordDesc"),
      html: `
        <div
          class="relative mx-auto my-4 w-full max-w-xs"
          style="direction: ${isRTL ? "rtl" : "ltr"};"
        >
          <input
            id="swal-new-password"
            type="password"
            placeholder="${t("authModal.placeholders.password")}"
            class="w-full rounded-xl border px-4 py-3 text-sm outline-none transition duration-200"
            style="
              margin: 0;
              width: 100%;
              box-sizing: border-box;
              border-color: ${isDarkMode ? "#475569" : "#cbd5e1"};
              background-color: ${isDarkMode ? "#1e293b" : "#ffffff"};
              color: ${isDarkMode ? "#f1f5f9" : "#0f172a"};
              padding-${isRTL ? "left" : "right"}: 3rem;
            "
          />

          <button
            id="swal-toggle-password"
            type="button"
            aria-label="Toggle password visibility"
            style="
              ${isRTL ? "left: 12px;" : "right: 12px;"}
              background: none;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
            "
            class="absolute top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors duration-200 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-slate-500 dark:hover:text-sky-400"
          >
            <svg
              id="eye-show"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
              style="width: 20px; height: 20px;"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

            <svg
              id="eye-hide"
              class="hidden"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
              style="width: 20px; height: 20px;"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          </button>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: t("authModal.forgotPassword.saveBtn"),
      cancelButtonText: t("authModal.forgotPassword.cancelBtn"),
      didOpen: () => {
        const input = document.getElementById("swal-new-password");
        const toggleButton = document.getElementById("swal-toggle-password");
        const eyeShow = document.getElementById("eye-show");
        const eyeHide = document.getElementById("eye-hide");

        if (toggleButton && input && eyeShow && eyeHide) {
          toggleButton.addEventListener("click", () => {
            const isPasswordHidden = input.getAttribute("type") === "password";
            input.setAttribute("type", isPasswordHidden ? "text" : "password");
            eyeShow.classList.toggle("hidden", isPasswordHidden);
            eyeHide.classList.toggle("hidden", !isPasswordHidden);
          });
        }
      },
      preConfirm: () => {
        const input = document.getElementById("swal-new-password");
        const value = input ? input.value : "";

        if (!value) {
          Swal.showValidationMessage(t("authModal.errors.passwordRequired"));
          return false;
        }

        const error = validatePassword(value);
        if (error) {
          Swal.showValidationMessage(error);
          return false;
        }

        return value;
      },
    });

    if (!newPassword) return;

    // ارسال کد و رمز جدید برای تغییر رمز
    const res = await resetPassword(targetEmail.trim(), resetCode.trim(), newPassword);

    if (res.success) {
      Swal.fire({
        ...swalTheme,
        icon: "success",
        iconColor: "#16a34a",
        title: t("authModal.forgotPassword.successTitle"),
        text: getAuthMessage(res.code, "authModal.messages.RESET_SUCCESS"),
        confirmButtonText: t("authModal.forgotPassword.confirmBtn"),
        customClass: {
          ...swalTheme.customClass,
          icon: "!border-green-500 !text-green-600 dark:!border-green-400 dark:!text-green-400",
        },
      });
      return;
    }

    Swal.fire({
      ...swalTheme,
      icon: "error",
      iconColor: "#e11d48",
      title: t("authModal.forgotPassword.errorTitle"),
      text: getAuthMessage(res.code, "authModal.messages.UNKNOWN_ERROR"),
      confirmButtonText: t("authModal.forgotPassword.confirmBtn"),
      customClass: {
        ...swalTheme.customClass,
        icon: "!border-rose-500 !text-rose-600 dark:!border-rose-400 dark:!text-rose-400",
      },
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (mode === "register") {
        if (!name.trim()) {
          toast.error(t("authModal.errors.nameRequired"), {
            toastId: AUTH_TOAST_ID,
          });
          return;
        }

        if (name.trim().length < 3) {
          toast.error(t("authModal.errors.nameLength"), {
            toastId: AUTH_TOAST_ID,
          });
          return;
        }
      }

      if (!email.trim()) {
        toast.error(t("authModal.errors.emailRequired"), {
          toastId: AUTH_TOAST_ID,
        });
        return;
      }

      if (!isValidEmail(email)) {
        toast.error(t("authModal.errors.emailInvalid"), {
          toastId: AUTH_TOAST_ID,
        });
        return;
      }

      if (!password) {
        toast.error(t("authModal.errors.passwordRequired"), {
          toastId: AUTH_TOAST_ID,
        });
        return;
      }

      if (mode === "register") {
        const passwordError = validatePassword(password);
        if (passwordError) {
          toast.error(passwordError, { toastId: AUTH_TOAST_ID });
          return;
        }

        const result = await register(name, email, password);

        if (!result.success) {
          toast.error(getAuthMessage(result.code, "authModal.messages.UNKNOWN_ERROR"), {
            toastId: AUTH_TOAST_ID,
          });
          return;
        }

        toast.success(getAuthMessage(result.code, "authModal.messages.REGISTER_SUCCESS"), {
          toastId: AUTH_TOAST_ID,
        });

        const userName = result.user?.name || name.trim();

        Swal.fire({
          icon: "success",
          title: t("authModal.swal.title"),
          text: t("authModal.swal.text", { name: userName }),
          confirmButtonColor: "#0ea5e9",
        });

        handleClose();
      } else {
        const result = await login(email, password);

        if (!result.success) {
          toast.error(getAuthMessage(result.code, "authModal.messages.UNKNOWN_ERROR"), {
            toastId: AUTH_TOAST_ID,
          });
          return;
        }

        toast.success(getAuthMessage(result.code, "authModal.messages.LOGIN_SUCCESS"), {
          toastId: AUTH_TOAST_ID,
        });

        handleClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div   className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-2 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-4"      onClick={handleClose}
    >
      <div
 className="w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 dark:bg-slate-800 sm:max-h-[calc(100dvh-3rem)] sm:p-8"        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
          {t("authModal.title")}
        </h2>

        <div className="relative mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-700">
          <span
            className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] rounded-lg bg-white shadow-sm transition-all duration-150 ease-in-out dark:bg-slate-800 ${
              isRTL
                ? mode === "login"
                  ? "right-1 translate-x-0"
                  : "right-1 -translate-x-full"
                : mode === "login"
                ? "left-1 translate-x-0"
                : "left-1 translate-x-full"
            }`}
          />
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`relative z-10 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-300 ${
              mode === "login"
                ? "text-sky-600 dark:text-sky-400"
                : "text-slate-500 dark:text-slate-300"
            }`}
          >
            {t("authModal.buttons.loginTab")}
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`relative z-10 rounded-lg py-2.5 text-sm font-semibold transition-colors duration-300 ${
              mode === "register"
                ? "text-sky-600 dark:text-sky-400"
                : "text-slate-500 dark:text-slate-300"
            }`}
          >
            {t("authModal.buttons.registerTab")}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className={`grid transition-all duration-300 ease-out ${
              mode === "register"
                ? "grid-rows-[1fr] opacity-100 translate-y-0"
                : "grid-rows-[0fr] opacity-0 translate-y-3"
            }`}
          >
            <div className="overflow-hidden">
              <input
                type="text"
                placeholder={t("authModal.placeholders.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={mode !== "register"}
                className="w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          <input
            type="email"
            placeholder={t("authModal.placeholders.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />

          <div className="relative">
            {/* <input
              type={showPassword ? "text" : "password"}
              placeholder={t("authModal.placeholders.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white ${
                isRTL ? "pl-11" : "pr-11"
              }`}
            /> */}
            <input
  type={showPassword ? "text" : "password"}
  placeholder={t("authModal.placeholders.password")}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  autoComplete={mode === "register" ? "new-password" : "current-password"}
  data-lpignore="true"
  data-1p-ignore="true"
  data-bwignore="true"
  className={`w-full rounded-lg border border-slate-300 p-3 outline-none transition focus:ring-2 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white ${
    isRTL ? "pl-11" : "pr-11"
  }`}
/>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword
                  ? t("authModal.aria.hide")
                  : t("authModal.aria.show")
              }
              className={`absolute top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 ${
                isRTL ? "left-3" : "right-3"
              }`}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

      
          {mode === "login" && (
  <div className="-mt-1 flex justify-start">
    <button
      type="button"
      onClick={handleForgotPassword}
      className="group inline-flex flex-row items-center gap-1.5 rounded-md px-1 py-1 text-xs font-medium text-slate-500 transition-colors duration-200 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:text-sky-400 dark:focus-visible:ring-offset-slate-800"
    >
      <span className="border-b border-transparent transition-colors duration-200 group-hover:border-current">
        {t("authModal.buttons.forgotPassword")}
      </span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 10.5V6.75A4.5 4.5 0 007.5 6.75V10.5m-1.5 0h12A1.5 1.5 0 0119.5 12v7.5A1.5 1.5 0 0118 21H6a1.5 1.5 0 01-1.5-1.5V12A1.5 1.5 0 016 10.5z"
        />
      </svg>
    </button>
  </div>
)}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-sky-600 py-3 font-semibold text-white transition duration-200 hover:bg-sky-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? t("authModal.buttons.submitting")
              : mode === "login"
              ? t("authModal.buttons.login")
              : t("authModal.buttons.register")}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
          {mode === "login"
            ? t("authModal.text.noAccount")
            : t("authModal.text.hasAccount")}
        </p>

        <button
          type="button"
          onClick={handleClose}
          className="mt-4 w-full rounded-lg border border-slate-300 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {t("authModal.buttons.close")}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;