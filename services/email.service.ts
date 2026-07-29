/**
 * Email Service
 * Handles email sending via Resend API
 */
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@srsmathaynk.org'
const FROM_NAME = 'Sri Raghavendra Swamy Matha'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  /**
   * Send an email
   */
  async send(params: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    try {
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      })

      if (error) {
        console.error('Resend error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, id: data?.id }
    } catch (err) {
      console.error('Email send error:', err)
      return { success: false, error: 'Failed to send email' }
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(
    email: string,
    name: string,
    verificationUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Sri Raghavendra Swamy Matha</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email</a>
        </div>
        <p>Or copy and paste this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Sri Raghavendra Swamy Matha<br>
          If you didn't create this account, please ignore this email.
        </p>
      </div>
    `

    const text = `
Sri Raghavendra Swamy Matha

Dear ${name},

Thank you for registering with us. Please verify your email address by visiting this link:

${verificationUrl}

This link expires in 24 hours.

If you didn't create this account, please ignore this email.
    `

    return this.send({
      to: email,
      subject: 'Verify your email - Sri Raghavendra Swamy Matha',
      html,
      text,
    })
  }

  /**
   * Send donation confirmation
   */
  async sendDonationConfirmation(
    email: string,
    name: string,
    donationDetails: {
      amount: number
      currency: string
      campaign?: string
      transactionId: string
      date: string
    }
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">🙏 Thank You for Your Donation</h2>
        <p>Dear ${name},</p>
        <p>We are deeply grateful for your generous donation. Your contribution helps us serve the devotees and maintain the temple.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Donation Details</h3>
          <p><strong>Amount:</strong> ${donationDetails.currency} ${donationDetails.amount.toLocaleString()}</p>
          ${donationDetails.campaign ? `<p><strong>Campaign:</strong> ${donationDetails.campaign}</p>` : ''}
          <p><strong>Transaction ID:</strong> ${donationDetails.transactionId}</p>
          <p><strong>Date:</strong> ${donationDetails.date}</p>
        </div>
        
        <p>Your donation has been received and will be used for temple activities and charitable works.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Sri Raghavendra Swamy Matha<br>
          This is an automated receipt. No signature is required.
        </p>
      </div>
    `

    return this.send({
      to: email,
      subject: `Donation Receipt - ${donationDetails.currency} ${donationDetails.amount.toLocaleString()}`,
      html,
    })
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(
    email: string,
    name: string,
    bookingDetails: {
      referenceNumber: string
      service: string
      date: string
      time?: string
    }
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">🙏 Seva Booking Confirmed</h2>
        <p>Dear ${name},</p>
        <p>Your seva booking has been confirmed. We look forward to serving you.</p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Reference:</strong> ${bookingDetails.referenceNumber}</p>
          <p><strong>Service:</strong> ${bookingDetails.service}</p>
          <p><strong>Date:</strong> ${bookingDetails.date}</p>
          ${bookingDetails.time ? `<p><strong>Time:</strong> ${bookingDetails.time}</p>` : ''}
        </div>
        
        <p>Please arrive 15 minutes before your scheduled time. Bring this reference number or the confirmation email.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Sri Raghavendra Swamy Matha
        </p>
      </div>
    `

    return this.send({
      to: email,
      subject: `Seva Booking Confirmed - ${bookingDetails.referenceNumber}`,
      html,
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Sri Raghavendra Swamy Matha</h2>
        <p>Dear ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Reset Password</a>
        </div>
        <p>Or copy and paste this link: <a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Sri Raghavendra Swamy Matha
        </p>
      </div>
    `

    const text = `
Sri Raghavendra Swamy Matha

Dear ${name},

We received a request to reset your password. Visit this link to create a new password:

${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, please ignore this email.
    `

    return this.send({
      to: email,
      subject: 'Reset Your Password - Sri Raghavendra Swamy Matha',
      html,
      text,
    })
  }
}

export const emailService = new EmailService()
