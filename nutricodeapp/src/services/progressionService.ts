import { pegarToken } from "@/src/utils/tokenManager";

const BASE_URL =
  "https://nutricode-api.onrender.com";

export type Progression = {
  xp: number;
  level: number;
  nextLevelRequirement: number;
  currentReward: number;

  currentWorkoutStreak: number;
  longestWorkoutStreak: number;

  currentDietStreak: number;
  longestDietStreak: number;

  currentWaterStreak: number;
  longestWaterStreak: number;
};

export async function getProgression(
  userId: string
): Promise<Progression> {

  const token = await pegarToken();

  if (!token) {
    throw new Error(
      "Usuário não autenticado"
    );
  }

  const res = await fetch(
    `${BASE_URL}/users/${userId}/progression`,
    {
      method: "GET",
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const texto = await res.text();

  console.log(
    "📡 GET PROGRESSION:",
    res.status,
    texto
  );

  if (!res.ok) {
    throw new Error(
      `Erro HTTP: ${res.status}`
    );
  }

  return JSON.parse(texto) as Progression;
}