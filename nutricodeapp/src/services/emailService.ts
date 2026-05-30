import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_t6ld5nv";
const TEMPLATE_ID = "template_sy1kwjq";
const PUBLIC_KEY = "I4iVHeraYQO7N-kMF";

emailjs.init(PUBLIC_KEY);

type EmailConfirmacaoParams = {
  email: string;
  username: string;
  token: string;
};

export async function enviarEmailConfirmacao({
  email,
  username,
  token,
}: EmailConfirmacaoParams) {
  if (!email || !username || !token) {
    throw new Error("Dados inválidos para envio de email");
  }

  const confirmLink =
    `https://nutricode-api.onrender.com/auth/confirm?token=${token}`;

 const templateParams = {

  email,

  username,

  link: confirmLink,

  logo:
    "https://i.imgur.com/9vGaO3v.png",
};

  try {
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams
    );

    console.log("📧 Email enviado com sucesso:", response);
    return response;
  } catch (error: any) {
    console.error("❌ EMAILJS ERROR:", error?.text || error);
    throw error;
  }
}