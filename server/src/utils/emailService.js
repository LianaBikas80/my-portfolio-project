import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * تابع ارسال پاسخ به کاربر
 * @param {string} to - ایمیل گیرنده (کاربر)
 * @param {string} subject - موضوع ایمیل
 * @param {string} text - متن ساده ایمیل
 * @param {string} html - متن HTML (برای ظاهر زیباتر)
 */
export const sendReplyEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: `"LianaDev Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * تابع ارسال کد ۶ رقمی بازیابی رمز عبور
 * @param {string} to - ایمیل کاربر
 * @param {string} code - کد ۶ رقمی تصادفی
 */
export const sendResetCodeEmail = async (to, code) => {
  const mailOptions = {
    from: `"LianaDev Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "کد تأیید بازیابی رمز عبور",
    text: `کد تأیید شما برای بازیابی رمز عبور: ${code} (اعتبار: ۱۰ دقیقه)`,
    html: `
      <div style="font-family: Tahoma, Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">بازیابی رمز عبور</h2>
        <p style="color: #334155; font-size: 15px;">درخواست بازیابی رمز عبور برای حساب کاربری شما در پورتفولیو ثبت شده است.</p>
        <div style="text-align: center; margin: 25px 0;">
          <span style="display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 10px 24px; border-radius: 6px; border: 1px dashed #6366f1;">
            ${code}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">این کد تا <strong>۱۰ دقیقه</strong> معتبر است. اگر شما این درخواست را نداده‌اید، لطفاً این ایمیل را نادیده بگیرید.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};