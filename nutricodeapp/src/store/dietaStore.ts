import { create } from 'zustand';

import {
  persist,
  createJSONStorage,
} from 'zustand/middleware';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Refeicao } from '@/src/types/Refeicao';

type DietaStore = {

  refeicoes: Refeicao[];

  /* =========================
     METAS
  ========================= */

  metaCalorias: number;

  metaProteina: number;

  metaCarboidrato: number;

  metaGordura: number;

  definirMetas: (
    metas: {
      calorias: number;
      proteina: number;
      carboidrato: number;
      gordura: number;
    }
  ) => void;

  /* =========================
     REFEIÇÕES
  ========================= */

  criarRefeicao: (
    nome: string
  ) => void;

  adicionarAlimento: (
    refeicaoId: string,
    alimento: any,
    quantidade: number
  ) => void;

  removerAlimento: (
    refeicaoId: string,
    itemId: string
  ) => void;

  limparDieta: () => void;
};

export function createDietaStore(userId: string) {

  return create<DietaStore>()(

    persist(

      (set) => ({

        /* =========================
           METAS
        ========================= */

        metaCalorias: 0,

        metaProteina: 0,

        metaCarboidrato: 0,

        metaGordura: 0,

        definirMetas: (metas) =>
          set({
            metaCalorias:
              metas.calorias,

            metaProteina:
              metas.proteina,

            metaCarboidrato:
              metas.carboidrato,

            metaGordura:
              metas.gordura,
          }),

        /* =========================
           REFEIÇÕES
        ========================= */

        refeicoes: [
          {
            id: '1',
            nome: 'Café da manhã',
            alimentos: [],
          },
          {
            id: '2',
            nome: 'Almoço',
            alimentos: [],
          },
          {
            id: '3',
            nome: 'Janta',
            alimentos: [],
          },
        ],

        criarRefeicao: (nome) =>

          set((state) => ({

            refeicoes: [
              ...state.refeicoes,
              {
                id: Date.now().toString(),
                nome,
                alimentos: [],
              },
            ],

          })),

        adicionarAlimento: (
          refeicaoId,
          alimento,
          quantidade
        ) =>

          set((state) => ({

            refeicoes:
              state.refeicoes.map((r) => {

                if (r.id === refeicaoId) {

                  return {

                    ...r,

                    alimentos: [
                      ...r.alimentos,
                      {
                        id: Date.now().toString(),
                        alimento,
                        quantidade,
                      },
                    ],

                  };
                }

                return r;
              }),

          })),

        removerAlimento: (
          refeicaoId,
          itemId
        ) =>

          set((state) => ({

            refeicoes:
              state.refeicoes.map((r) => {

                if (r.id === refeicaoId) {

                  return {

                    ...r,

                    alimentos:
                      r.alimentos.filter(
                        (i) =>
                          i.id !== itemId
                      ),

                  };
                }

                return r;
              }),

          })),

        limparDieta: () =>

          set({
            refeicoes: [],
          }),

      }),

      {
        name: `nutricode-dieta-${userId}`,

        storage:
          createJSONStorage(
            () => AsyncStorage
          ),
      }

    )

  );
}