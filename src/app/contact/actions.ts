"use server"

export type ContactState = {
  success: boolean
  error?: string
}

export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = formData.get("name")?.toString().trim()
  const email = formData.get("email")?.toString().trim()
  const subject = formData.get("subject")?.toString().trim()
  const message = formData.get("message")?.toString().trim()

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all required fields." }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." }
  }

  if (message.length < 10) {
    return { success: false, error: "Message must be at least 10 characters." }
  }

  // -------------------------------------------------------
  // Email sending via Resend (configure RESEND_API_KEY in .env)
  // Uncomment and install: npm install resend
  // -------------------------------------------------------
  // const { Resend } = await import("resend")
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // await resend.emails.send({
  //   from: "Portfolio Contact <noreply@huyhk.dev>",
  //   to: "contact@huyhk.dev",
  //   replyTo: email,
  //   subject: `[Portfolio] ${subject ?? "New message"} — from ${name}`,
  //   html: `<p><strong>Name:</strong> ${name}</p>
  //          <p><strong>Email:</strong> ${email}</p>
  //          <p><strong>Message:</strong></p>
  //          <p>${message.replace(/\n/g, "<br>")}</p>`,
  // })

  // Simulate network delay in development
  await new Promise((resolve) => setTimeout(resolve, 600))

  console.log("[Contact Form]", { name, email, subject, message })

  return { success: true }
}
