import AsyncStorage from '@react-native-async-storage/async-storage';
import { pegarToken, pegarUsuario } from '@/src/utils/storage';
import { DiaTreino } from '@/src/types/Treino';

const BASE_URL = 'https://nutricode-api.onrender.com';

/* =========================
     CHAVE POR USUÁRIO
========================= */
function getKey(userId: string) {
  return `TREINOS_${userId}`;
}

/* =========================
     SALVAR
========================= */
export async function salvarTreinos(userId: string, dias: DiaTreino[]) {
  try {
    await AsyncStorage.setItem(getKey(userId), JSON.stringify(dias));
  } catch (error) {
    console.log('❌ Erro ao salvar treinos:', error);
  }
}

/* =========================
     CARREGAR
========================= */
export async function carregarTreinos(userId: string): Promise<DiaTreino[]> {
  try {
    const dados = await AsyncStorage.getItem(getKey(userId));
    if (!dados) return [];
    return JSON.parse(dados) as DiaTreino[];
  } catch (error) {
    console.log('❌ Erro ao carregar treinos:', error);
    return [];
  }
}

/* =========================
     LIMPAR
========================= */
export async function limparTreinos(userId: string) {
  try {
    await AsyncStorage.removeItem(getKey(userId));
  } catch (error) {
    console.log('❌ Erro ao limpar treinos:', error);
  }
}

/* =========================
     NOVO: REGISTRAR TREINO DO DIA
========================= */
export async function registrarTreinoDoDia() {
  const user = await pegarUsuario();
  const userId = user?.id || user?.userId;

  if (!userId) throw new Error('Usuário não encontrado');

  const token = await pegarToken();

  if (!token) throw new Error('Usuário não autenticado');

  const body = {
    date: new Date().toISOString().split('T')[0],
    isFinished: true,
  };

  const resposta = await fetch(
    `${BASE_URL}/users/${userId}/workout-performed`,
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

  console.log('🏋️ POST TREINO STATUS:', resposta.status);
  console.log('🏋️ POST TREINO RESPONSE:', texto);

  if (!resposta.ok) {
    throw new Error(`Erro HTTP: ${resposta.status}`);
  }

  if (!texto) {
    throw new Error('Resposta vazia da API');
  }

  return JSON.parse(texto);
}