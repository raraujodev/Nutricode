import { pegarToken } from "@/src/utils/storage";
import { UpdateUserInfoDTO } from "@/src/types/UserInfo";

const BASE_URL = "https://nutricode-api.onrender.com";

/* =========================
   TYPES
========================= */
export type UserInfo = {
  height?: number;
  age?: number;
  sex?: "MALE" | "FEMALE";
};

/* =========================
   GET USER INFO
========================= */
export async function getUserInfo(
  userId: string
): Promise<UserInfo | null> {

  const token = await pegarToken();

  if (!token) {
    throw new Error("Usuário não autenticado");
  }

  try {

    const res = await fetch(`${BASE_URL}/users/${userId}/info`, {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });

    const texto = await res.text();

    console.log("📡 GET USER INFO:", res.status, texto);

    // caso não exista info ainda
    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error(`Erro ao buscar user info: ${res.status}`);
    }

    return texto ? JSON.parse(texto) : null;

  } catch (err) {

    console.log("❌ Erro ao buscar user info:", err);
    throw err;
  }
}

/* =========================
   UPDATE USER INFO
========================= */
export async function updateUserInfo(
  userId: string,
  body: UpdateUserInfoDTO
) {

  const token = await pegarToken();

  if (!token) {
    throw new Error("Usuário não autenticado");
  }

  const res = await fetch(`${BASE_URL}/users/${userId}/info`, {
    method: "PUT",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const texto = await res.text();

  console.log("📡 UPDATE USER INFO:", res.status, texto);

  if (!res.ok) {
    throw new Error(`Erro HTTP: ${res.status}`);
  }

  return texto ? JSON.parse(texto) : null;
}