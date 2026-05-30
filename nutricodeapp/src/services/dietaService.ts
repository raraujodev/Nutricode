import { pegarToken } from '@/src/utils/tokenManager';
import { pegarUsuario } from '@/src/utils/storage';

const BASE_URL = 'https://nutricode-api.onrender.com';

/* =========================
   👤 PEGAR USER LOGADO
========================= */
async function getUserId(): Promise<string> {
  const user = await pegarUsuario();
  // aceita user.id OU user.userId, igual ao padrão usado no resto do app
  const id = user?.id || user?.userId;
  if (!id) {
    throw new Error('Usuário não encontrado no storage');
  }
  return id;
}

/* =========================
   POST - registrar dieta do dia
========================= */
export async function registrarDietaDoDia() {
  const userId = await getUserId();
  const token = await pegarToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const body = {
    date: new Date().toISOString().split('T')[0],
    isFinished: true,
  };

  const resposta = await fetch(
    `${BASE_URL}/users/${userId}/diet-performed`,
    {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  const texto = await resposta.text();
  console.log('🍽️ POST DIETA STATUS:', resposta.status);
  console.log('🍽️ POST DIETA RESPONSE:', texto);

  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`);
  }

  // resposta vazia não é necessariamente erro — alguns endpoints retornam 200/204 sem body.
  if (!texto || texto.trim() === '') {
    return { xpEarned: 0 };
  }

  try {
    return JSON.parse(texto);
  } catch {
    console.log('⚠️ Resposta não é JSON válido:', texto);
    return { xpEarned: 0 };
  }
}

/* =========================
   🔹 GET - histórico performed (gráfico homepage)
========================= */
export type DietaRealizada = {
  date: string;
  caloriesConsumed: number;
  proteinConsumed: number;
  isGoalMet: boolean;
};

export async function getDietaRealizada(userId: string): Promise<DietaRealizada[]> {
  const token = await pegarToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const res = await fetch(
    `${BASE_URL}/users/${userId}/diet-performed`,
    {
      method: 'GET',
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const texto = await res.text();
  console.log('🥗 DIETA REALIZADA:', texto);

  if (!res.ok) {
    throw new Error(`Erro HTTP: ${res.status}`);
  }

  return texto ? JSON.parse(texto) : [];
}