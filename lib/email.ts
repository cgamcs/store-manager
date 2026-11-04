import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordResetEmail(correo: string, nombre: string, token: string) {
  await transporter.sendMail({
    from: `"Abarrotes Don Tello" <${process.env.SMTP_USER}>`,
    to: correo,
    subject: "Restablece tu contraseña",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #333;">Hola, ${nombre}</h2>
        <p style="color: #555;">Usa el siguiente código para restablecer tu contraseña:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; text-align: center;
                    background: #f5f5f5; border-radius: 12px; padding: 24px; margin: 24px 0;
                    color: #333;">
          ${token}
        </div>
        <p style="color: #888; font-size: 14px;">El código expira en 5 minutos.</p>
        <p style="color: #888; font-size: 14px;">Si no solicitaste esto, ignora este mensaje.</p>
      </div>
    `,
  })
}

export async function sendVerificationEmail(correo: string, nombre: string, token: string) {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000"
  const verifyUrl = `${appUrl}/verificar?correo=${encodeURIComponent(correo)}`
  await transporter.sendMail({
    from: `"Abarrotes Don Tello" <${process.env.SMTP_USER}>`,
    to: correo,
    subject: "Verifica tu correo electrónico",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #333;">Hola, ${nombre}</h2>
        <p style="color: #555;">Usa el siguiente código para verificar tu cuenta:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 10px; text-align: center;
                    background: #f5f5f5; border-radius: 12px; padding: 24px; margin: 24px 0;
                    color: #333;">
          ${token}
        </div>
        <p style="text-align: center; margin: 24px 0;">
          <a href="${verifyUrl}" style="display: inline-block; background: #c2410c; color: #fff;
                    text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 12px;">
            Ir a verificar mi cuenta
          </a>
        </p>
        <p style="color: #888; font-size: 14px;">El código expira en 5 minutos.</p>
        <p style="color: #888; font-size: 14px;">Si no creaste esta cuenta, ignora este mensaje.</p>
      </div>
    `,
  })
}
