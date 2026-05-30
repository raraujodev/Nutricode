import AsyncStorage from "@react-native-async-storage/async-storage";

/* =========================
  🔐 KEYS
========================= */
const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";
const USER_KEY = "USER";
const ONBOARDING_KEY = "ONBOARDING_DONE";

/* =========================
   TOKENS
========================= */

// salvar tokens
export async function salvarTokens(accessToken: string, refreshToken: string) {
  try {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  } catch (err) {
    console.log("❌ Erro ao salvar tokens:", err);
  }
}

// pegar access token
export async function pegarToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (err) {
    console.log("❌ Erro ao pegar token:", err);
    return null;
  }
}

// pegar refresh token
export async function pegarRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (err) {
    console.log("❌ Erro ao pegar refresh token:", err);
    return null;
  }
}

/* =========================
   USER
========================= */

// salvar usuário
export async function salvarUsuario(user: any) {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.log("❌ Erro ao salvar usuário:", err);
  }
}

// pegar usuário
export async function pegarUsuario() {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.log("❌ Erro ao pegar usuário:", err);
    return null;
  }
}

/* =========================
   ONBOARDING 
========================= */


export async function salvarOnboardingFeito() {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    console.log("✅ Onboarding marcado como concluído");
  } catch (err) {
    console.log("❌ Erro ao salvar onboarding:", err);
  }
}

// verificar se onboarding foi feito
export async function pegarOnboardingFeito(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);

  
    return value === "true";
  } catch (err) {
    console.log("❌ Erro ao pegar onboarding:", err);
    return false;
  }
}


export async function resetarOnboarding() {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    console.log("♻️ Onboarding resetado");
  } catch (err) {
    console.log("❌ Erro ao resetar onboarding:", err);
  }
}

/* =========================
  LOGOUT
========================= */

export async function limparStorage() {
  try {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_KEY,
      ONBOARDING_KEY,
    ]);

    console.log("🧹 Storage limpo");
  } catch (err) {
    console.log("❌ Erro ao limpar storage:", err);
  }
}

/* =========================
   PESO
========================= */

const PESO_KEY = "USER_WEIGHT";

// salvar peso
export async function salvarPeso(peso: number) {
  try {
    await AsyncStorage.setItem(
      PESO_KEY,
      JSON.stringify(peso)
    );
  } catch (err) {
    console.log("❌ Erro ao salvar peso:", err);
  }
}

// pegar peso
export async function pegarPeso(): Promise<number | null> {
  try {
    const peso = await AsyncStorage.getItem(PESO_KEY);

    return peso ? JSON.parse(peso) : null;
  } catch (err) {
    console.log("❌ Erro ao pegar peso:", err);
    return null;
  }
}