import { transporter } from '~/config/mail.config.js'
import userRepository from '~/repositories/user.repository.js'
import hash from '~/utils/hash.js'

class EmailService {
  async sendVerifyEmail(email: string, otp: string) {
    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <h2>Email Verification</h2>
            <p>Your verification code:</p>
            <h1>${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    })
  }

  async verifyEmail(email: string, code: string) {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.is_verified) {
      throw new Error('Email already verified')
    }

    if (!user.email_verify_code || !user.email_verify_expires) {
      throw new Error('Verification code not found')
    }

    if (user.email_verify_expires < new Date()) {
      throw new Error('Verification code expired')
    }

    const isMatch = await hash.comparePassword(code, user.email_verify_code)

    if (!isMatch) {
      throw new Error('Invalid verification code')
    }

    await userRepository.update(user._id.toString(), {
      is_verified: true,
      email_verify_code: null,
      email_verify_expires: null,
    })

    return {
      message: 'Email verified successfully',
    }
  }
}

export default new EmailService()
