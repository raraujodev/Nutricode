import { requisicao } from './api';
import { Alimento } from '@/src/types/Alimento';

// Buscar todos os alimentos
export async function buscarAlimentos(): Promise<Alimento[]> {
  return await requisicao('/alimentos/buscar');
}

// Buscar alimento por ID
export async function buscarAlimentoPorId(id: number): Promise<Alimento> {
  return await requisicao(`/alimentos/${id}`);
}

// Buscar alimentos por nome
export async function buscarAlimentosPorNome(nome: string): Promise<Alimento[]> {
  const nomeLimpo = encodeURIComponent(nome.trim().toLowerCase());

  return await requisicao(`/alimentos/buscar?nome=${nomeLimpo}`);
}