import AsyncStorage from '@react-native-async-storage/async-storage';
import { Refeicao } from '@/src/types/Refeicao';

function getStorageKey(userId: string) {
  return `REFEICOES_USUARIO_${userId}`;
}

/* =========================
   SALVAR
========================= */
export async function salvarRefeicoes(
  userId: string,
  refeicoes: Refeicao[]
) {
  try {
    await AsyncStorage.setItem(
      getStorageKey(userId),
      JSON.stringify(refeicoes)
    );
  } catch (error) {
    console.log('❌ Erro ao salvar refeições:', error);
  }
}

/* =========================
    CARREGAR
========================= */
export async function carregarRefeicoes(
  userId: string
): Promise<Refeicao[]> {
  try {
    const dados = await AsyncStorage.getItem(
      getStorageKey(userId)
    );

    if (!dados) return [];

    return JSON.parse(dados) as Refeicao[];
  } catch (error) {
    console.log('❌ Erro ao carregar refeições:', error);
    return [];
  }
}

/* =========================
    LIMPAR
========================= */
export async function limparRefeicoes(userId: string) {
  try {
    await AsyncStorage.removeItem(
      getStorageKey(userId)
    );
  } catch (error) {
    console.log('❌ Erro ao limpar refeições:', error);
  }
}