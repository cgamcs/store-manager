import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
})

export async function sendPasswordResetEmail(correo: string, nombre: string, token: string) {
  await transporter.sendMail({
    from: '"Abarrotes Don Tello" <no-reply@dontello.com>',
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
  await transporter.sendMail({
    from: '"Abarrotes Don Tello" <no-reply@dontello.com>',
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
        <p style="color: #888; font-size: 14px;">El código expira en 5 minutos.</p>
        <p style="color: #888; font-size: 14px;">Si no creaste esta cuenta, ignora este mensaje.</p>
      </div>
    `,
  })
}
