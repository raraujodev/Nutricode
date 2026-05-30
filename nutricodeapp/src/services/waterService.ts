import { requisicao } from './api';
import { WaterLog, CreateWaterLogDTO } from '@/src/types/Water';
import { pegarToken, pegarUsuario } from '@/src/utils/storage';

const BASE_URL = 'https://nutricode-api.onrender.com';

/* =========================
    PEGAR USER LOGADO
========================= */
async function getUserId(): Promise<string> {
  const user = await pegarUsuario();
  if (!user?.id) {
    throw new Error('Usuário não encontrado no storage');
  }
  return user.id;
}

/* =========================
    GET - todos registros
========================= */
export async function getWaterLogs(): Promise<WaterLog[]> {
  const userId = await getUserId();
  const data = await requisicao(`/users/${userId}/water-logs`);
  return data as WaterLog[];
}

/* =========================
    GET - últimos 30 dias
========================= */
export async function getLastMonthWaterLogs(): Promise<WaterLog[]> {
  const userId = await getUserId();
  const data = await requisicao(`/users/${userId}/water-logs/last-month`);
  return data as WaterLog[];
}

/* =========================
  POST - salvar/atualizar consumo
========================= */
export async function saveWaterLog(
  body: CreateWaterLogDTO
): Promise<WaterLog> {
  const userId = await getUserId();
  const token = await pegarToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const resposta = await fetch(
    `${BASE_URL}/users/${userId}/water-logs`,
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
  console.log('💧 POST WATER STATUS:', resposta.status);
  console.log('💧 POST WATER RESPONSE:', texto);

  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`);
  }
  if (!texto) {
    throw new Error('Resposta vazia da API');
  }

  return JSON.parse(texto) as WaterLog;
}

/* =========================
    GET - histórico 
========================= */
export type AguaRealizada = {
  date: string;
  amount: number;
  isGoalMet: boolean;
};

export async function getAguaRealizada(userId: string): Promise<AguaRealizada[]> {
  const token = await pegarToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const res = await fetch(
    `${BASE_URL}/users/${userId}/water-performed`,
    {
      method: 'GET',
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const texto = await res.text();
  console.log('💧 ÁGUA REALIZADA:', texto);

  if (!res.ok) {
    throw new Error(`Erro HTTP: ${res.status}`);
  }

  return texto ? JSON.parse(texto) : [];
}