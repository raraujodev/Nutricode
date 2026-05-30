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

// 💾 salvar tokens
export async function salvarTokens(
  accessToken: string,
  refreshToken: string
) {
  try {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  } catch (err) {
    console.log("❌ Erro ao salvar tokens:", err);
  }
}

// 📥 pegar access token
export async function pegarToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (err) {
    console.log("❌ Erro ao pegar token:", err);
    return null;
  }
}

// 📥 pegar refresh token
export async function pegarRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (err) {
    console.log("❌ Erro ao pegar refresh token:", err);
    return null;
  }
}

/* =========================
   👤 USER
========================= */

// 💾 salvar usuário
export async function salvarUsuario(user: any) {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.log("❌ Erro ao salvar usuário:", err);
  }
}

// 📥 pegar usuário
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
   🚀 ONBOARDING POR USUÁRIO
========================= */

// 💾 salvar onboarding
export async function salvarOnboardingFeito(userId: string) {
  try {
    await AsyncStorage.setItem(
      `${ONBOARDING_KEY}_${userId}`,
      "true"
    );

    console.log("✅ Onboarding marcado como concluído");
  } catch (err) {
    console.log("❌ Erro ao salvar onboarding:", err);
  }
}

// 📥 verificar onboarding
export async function pegarOnboardingFeito(
  userId: string
): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(
      `${ONBOARDING_KEY}_${userId}`
    );

    return value === "true";
  } catch (err) {
    console.log("❌ Erro ao pegar onboarding:", err);
    return false;
  }
}

// ♻️ resetar onboarding
export async function resetarOnboarding(userId: string) {
  try {
    await AsyncStorage.removeItem(
      `${ONBOARDING_KEY}_${userId}`
    );

    console.log("♻️ Onboarding resetado");
  } catch (err) {
    console.log("❌ Erro ao resetar onboarding:", err);
  }
}

/* =========================
   🚪 LOGOUT
========================= */

export async function limparStorage() {
  try {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_KEY,
    ]);

    console.log("🧹 Storage limpo");
  } catch (err) {
    console.log("❌ Erro ao limpar storage:", err);
  }
}