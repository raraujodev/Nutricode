import {
  salvarTokens,
  salvarUsuario,
  pegarRefreshToken,
  limparStorage,
} from "@/src/utils/storage";

const API_URL =
  "https://nutricode-api.onrender.com";

/* =========================
   REGISTER
========================= */

export async function register(
  username: string,
  email: string,
  password: string
) {

  const res = await fetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        username,
        email,
        password,
      }),
    }
  );

  const data =
    await res.json().catch(
      () => null
    );

  if (!res.ok) {
    throw new Error(
      data?.message ||
      `Erro HTTP: ${res.status}`
    );
  }

  return data;
}

/* =========================
   LOGIN
========================= */

export async function login(
  email: string,
  password: string
) {

  const res = await fetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  const data =
    await res.json().catch(
      () => null
    );

  console.log(
    "🔐 LOGIN STATUS:",
    res.status
  );

  console.log(
    "🔐 LOGIN DATA:",
    data
  );

  if (!res.ok) {
    throw new Error(
      data?.message ||
      `Erro HTTP: ${res.status}`
    );
  }

  const accessToken =
    data?.token ||
    data?.accessToken ||
    data?.access_token;

  const refreshToken =
    data?.refreshToken ||
    data?.refresh_token;

  if (
    !accessToken ||
    !refreshToken
  ) {
    throw new Error(
      "Tokens inválidos na resposta do login"
    );
  }

  /* =========================
     SALVAR TOKENS
  ========================= */

  await salvarTokens(
    accessToken,
    refreshToken
  );

  /* =========================
     BUSCAR USUÁRIO
  ========================= */

  try {

    const resUser =
      await fetch(
        `${API_URL}/users/me`,
        {
          method: "GET",

          headers: {
            Accept: "*/*",

            Authorization:
              `Bearer ${accessToken}`,
          },
        }
      );

    const texto =
      await resUser.text();

    console.log(
      "📡 GET /users/me:",
      texto
    );

    if (!resUser.ok) {
      throw new Error(
        `Erro ao buscar usuário: ${resUser.status}`
      );
    }

    const rawUser =
      texto
        ? JSON.parse(texto)
        : null;

    if (
      !rawUser ||
      !rawUser.userId
    ) {
      throw new Error(
        "Usuário inválido retornado pela API"
      );
    }

    const user = {
      id: rawUser.userId,

      username:
        rawUser.username,

      email:
        rawUser.email,

      createdAt:
        rawUser.creationTimestamp,

      updatedAt:
        rawUser.updateTimestamp,
    };

    await salvarUsuario(user);

    console.log(
      "💾 Usuário salvo normalizado:",
      user
    );

  } catch (err) {

    console.error(
      "❌ Erro ao buscar usuário:",
      err
    );

    throw new Error(
      "Usuário não encontrado após login"
    );
  }

  return data;
}

/* =========================
   LOGOUT
========================= */

export async function logout() {

  try {

    const refreshToken =
      await pegarRefreshToken();

    console.log(
      "🔐 REFRESH TOKEN:",
      refreshToken
    );

    if (refreshToken) {

      const res =
        await fetch(
          `${API_URL}/auth/logout`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              refreshToken,
            }),
          }
        );

      const texto =
        await res.text();

      console.log(
        "📡 LOGOUT:",
        res.status,
        texto
      );
    }

  } catch (err) {

    console.log(
      "❌ Erro logout:",
      err
    );

  } finally {

    /* =========================
       LIMPA STORAGE
    ========================= */

    await limparStorage();

    console.log(
      "🧹 Usuário deslogado"
    );
  }
}