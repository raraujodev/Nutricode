import { pegarToken } from "@/src/utils/storage";

const URL_BASE = "https://nutricode-api.onrender.com";

export async function requisicao(endpoint: string) {
  const token = await pegarToken();

  console.log("🔐 TOKEN ENVIADO:", token);

  if (!token) {
    throw new Error("Usuário não autenticado (token ausente)");
  }

  const resposta = await fetch(`${URL_BASE}${endpoint}`, {
    method: "GET",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const texto = await resposta.text();

  console.log("📡 STATUS:", resposta.status);
  console.log("📡 RESPOSTA RAW:", texto);

  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`);
  }

  return texto ? JSON.parse(texto) : null;
}