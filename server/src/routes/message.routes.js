import express from 'express'
import Message from '../models/Message.js'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import { sendReplyEmail } from '../utils/emailService.js'

const router = express.Router()

// ۱. دریافت تمام پیام‌ها برای نمایش در پنل ادمین (GET /api/messages)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 })
    res.status(200).json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ message: 'خطا در دریافت لیست پیام‌ها', error: error.message })
  }
})

// ۲. ثبت پیام جدید از فرم تماس با ما (POST /api/messages)
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'لطفاً تمامی فیلدها را پر کنید.' })
    }

    const newMessage = await Message.create({
      name,
      email,
      subject,
      message
    })

    res.status(201).json({
      message: 'پیام شما با موفقیت ارسال شد.',
      data: newMessage
    })
  } catch (error) {
    console.error('Error creating message:', error)
    res.status(500).json({ message: 'خطا در ثبت پیام', error: error.message })
  }
})

// ۳. حذف پیام توسط ادمین (DELETE /api/messages/:id)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params
    const deletedMessage = await Message.findByIdAndDelete(id)

    if (!deletedMessage) {
      return res.status(404).json({ message: 'پیام مورد نظر برای حذف یافت نشد.' })
    }

    res.status(200).json({ message: 'پیام با موفقیت حذف شد.' })
  } catch (error) {
    console.error('Error deleting message:', error)
    res.status(500).json({ message: 'خطا در حذف پیام', error: error.message })
  }
})

// ۴. ارسال پاسخ به ایمیل کاربر توسط ادمین (POST /api/messages/:id/reply)
router.post('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const { replyText } = req.body
    const { id } = req.params

    if (!replyText || replyText.trim() === '') {
      return res.status(400).json({ message: 'متن پاسخ نمی‌تواند خالی باشد.' })
    }

    const messageDoc = await Message.findById(id)
    if (!messageDoc) {
      return res.status(404).json({ message: 'پیام مورد نظر یافت نشد.' })
    }

    const emailSubject = `پاسخ به پیام شما: ${messageDoc.subject}`
    const emailHtml = `
      <div style="font-family: Tahoma, sans-serif; direction: rtl; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">پاسخ به پیام شما در LianaDev</h2>
        <p>سلام <strong>${messageDoc.name}</strong> عزیز،</p>
        <p>از پیام شما با موضوع «<em>${messageDoc.subject}</em>» سپاسگزاریم.</p>
        
        <div style="background-color: #f8fafc; border-right: 4px solid #2563eb; padding: 12px; margin: 16px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #1e293b;">متن پاسخ:</h4>
          <p style="margin: 0; color: #475569;">${replyText.replace(/\n/g, '<br/>')}</p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">این ایمیل به صورت خودکار از پنل مدیریت وب‌سایت ارسال شده است.</p>
      </div>
    `

    await sendReplyEmail(messageDoc.email, emailSubject, replyText, emailHtml)

    messageDoc.replyMessage = replyText
    messageDoc.repliedAt = new Date()
    messageDoc.isRead = true
    await messageDoc.save()

    res.status(200).json({
      message: 'پاسخ با موفقیت به ایمیل کاربر ارسال و ذخیره شد.',
      data: messageDoc
    })
  } catch (error) {
    console.error('Error replying to message:', error)
    res.status(500).json({ message: 'خطا در ارسال پاسخ یا ایمیل.', error: error.message })
  }
})

export default router