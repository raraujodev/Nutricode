import { pegarToken } from "@/src/utils/tokenManager";

const BASE_URL =
  "https://nutricode-api.onrender.com";

export type TreinoRealizado = {
  date: string;
  isFinished: boolean;
  xpEarned: number;
};

export async function getTreinosRealizados(
  userId: string
): Promise<TreinoRealizado[]> {

  const token =
    await pegarToken();

  if (!token) {
    throw new Error(
      "Usuário não autenticado"
    );
  }

  const res = await fetch(
    `${BASE_URL}/users/${userId}/workout-performed`,
    {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const texto =
    await res.text();

  console.log(
    "🏋️ TREINOS:",
    texto
  );

  if (!res.ok) {
    throw new Error(
      `Erro HTTP: ${res.status}`
    );
  }

  return texto
    ? JSON.parse(texto)
    : [];
}