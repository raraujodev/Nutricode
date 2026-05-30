import {
  pegarToken,
} from "@/src/utils/storage";

const API_URL =
  "https://nutricode-api.onrender.com";

/* =========================
   DELETAR USUÁRIO
========================= */

export async function deletarUsuarioService(
  userId: string
) {

  const token =
    await pegarToken();

  if (!token) {
    throw new Error(
      "Usuário não autenticado"
    );
  }

  try {

    const res = await fetch(
      `${API_URL}/users/${userId}`,
      {
        method: "DELETE",

        headers: {
          Accept: "*/*",

          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const texto =
      await res.text();

    console.log(
      "📡 DELETE USER:",
      res.status,
      texto
    );

    if (!res.ok) {
      throw new Error(
        `Erro HTTP: ${res.status}`
      );
    }

    return true;

  } catch (err) {

    console.log(
      "❌ Erro deletar usuário:",
      err
    );

    throw err;
  }
}