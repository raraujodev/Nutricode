import { requisicao } from "@/src/services/api";

// BUSCAR EXERCÍCIOS POR NOME
export async function buscarExerciciosPorNome(
  nome: string,
  page: number = 0,
  size: number = 20
) {
  try {
    if (!nome.trim()) return { content: [] };

    const endpoint = `/exercicios/buscar/nome?name=${encodeURIComponent(nome)}&page=${page}&size=${size}`;

    const data = await requisicao(endpoint);

    return data; // { content: [...] }

  } catch (error) {
    console.log('❌ ERRO SERVICE EXERCÍCIO:', error);
    return { content: [] };
  }
}