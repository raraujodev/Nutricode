import { pegarToken } from "@/src/utils/tokenManager";

const BASE_URL =
  "https://nutricode-api.onrender.com";

export type RegistroPeso = {
  weight: number;
  date: string;
};

export async function getRegistrosPeso(
  userId: string
): Promise<RegistroPeso[]> {

  const token =
    await pegarToken();

  if (!token) {
    throw new Error(
      "Usuário não autenticado"
    );
  }

  const res = await fetch(
    `${BASE_URL}/users/${userId}/weight-logs`,
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
    "📈 REGISTROS PESO:",
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

export async function salvarRegistroPeso(
  userId: string,
  body: {
    weight: number;
    date: string;
  }
) {

  const token =
    await pegarToken();

  if (!token) {
    throw new Error(
      "Usuário não autenticado"
    );
  }

  const res = await fetch(
    `${BASE_URL}/users/${userId}/weight-logs`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Accept: "*/*",
        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify(body),
    }
  );

  const texto =
    await res.text();

  console.log(
    "📤 PESO SALVO:",
    texto
  );

  if (!res.ok) {
    throw new Error(
      `Erro HTTP: ${res.status}`
    );
  }

  return texto
    ? JSON.parse(texto)
    : null;
}