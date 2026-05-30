export type ExercicioItem = {
  id: string;
  exercicio: any;
  series: number;
  repeticoes: number;
};

export type DiaTreino = {
  id: string;
  nome: string;
  exercicios: ExercicioItem[];
  lastCompletedDate?: string; 
};