export type Item = {
  id: string;
  alimento: any;
  quantidade: number;
};

export type Refeicao = {
  id: string;
  nome: string;
  alimentos: Item[];

  concluida?: boolean;
};