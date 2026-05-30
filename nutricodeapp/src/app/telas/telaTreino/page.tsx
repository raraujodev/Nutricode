import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Alert,
} from 'react-native';

import ListaTreinos from './ListaTreinos';
import TelaTreinoDia from './TelaTreinoDia';
import TelaBuscarExercicio from './TelaBuscarExercicio';

import { DiaTreino } from '@/src/types/Treino';

import { registrarTreinoDoDia } from '@/src/services/treinoService';
import { tocarXp } from '@/src/utils/xp/tocarXp';

import {
  carregarTreinos,
  salvarTreinos,
} from '@/src/services/treinoService';

import { pegarUsuario } from '@/src/utils/storage';

export default function TelaTreino() {

  const [modo, setModo] =
    useState<'lista' | 'dia' | 'buscar'>('lista');

  const [dias, setDias] =
    useState<DiaTreino[]>([]);

  const [diaSelecionado, setDiaSelecionado] =
    useState<DiaTreino | null>(null);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [modalXpVisible, setModalXpVisible] = useState(false);
  const [xpGanho, setXpGanho] = useState(0);

  /* =========================
     DIAS PADRÃO
  ========================= */
  const diasPadrao: DiaTreino[] = [
    { id: '1', nome: 'Segunda', exercicios: [] },
    { id: '2', nome: 'Terça', exercicios: [] },
    { id: '3', nome: 'Quarta', exercicios: [] },
    { id: '4', nome: 'Quinta', exercicios: [] },
    { id: '5', nome: 'Sexta', exercicios: [] },
    { id: '6', nome: 'Sábado', exercicios: [] },
    { id: '7', nome: 'Domingo', exercicios: [] },
  ];


  /* =========================
      CARREGAR TREINOS
  ========================= */
  useEffect(() => {
    async function init() {
      

      const user = await pegarUsuario();

      const id = user?.id || user?.userId;

      if (!id) return;

      setUserId(id);

      const dados = await carregarTreinos(id);

      //  PRIMEIRO ACESSO
      if (dados.length === 0) {

        setDias(diasPadrao);

        await salvarTreinos(
          id,
          diasPadrao
        );

      } else {

        setDias(dados);

      }
    }

    init();
  }, []);

  /* =========================
      SALVAR
  ========================= */
  async function salvarDias(
    novosDias: DiaTreino[]
  ) {

    if (!userId) return;

    setDias(novosDias);

    await salvarTreinos(
      userId,
      novosDias
    );
  }

  /* =========================
      SELECIONAR DIA
  ========================= */
  function selecionarDia(
    dia: DiaTreino
  ) {
    setDiaSelecionado(dia);
    setModo('dia');
  }

  function voltarLista() {
    setModo('lista');
    setDiaSelecionado(null);
  }

  function irBuscar() {
    setModo('buscar');
  }

  const diasSemana = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ];

  const hoje = diasSemana[new Date().getDay()];

  async function concluirDia(id: string) {
    const dia = dias.find((d) => d.id === id);
    if (!dia) return;

    //  bloqueia se não tiver exercícios
    if (dia.exercicios.length === 0) {
      Alert.alert('Sem exercícios', 'Adicione exercícios antes de concluir o treino.');
      return;
    }

    const diasSemana = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ];

    const hojeNome = diasSemana[new Date().getDay()];
    const hoje = new Date().toISOString().split('T')[0];

    //  bloqueia outro dia
    if (dia.nome !== hojeNome) return;

    //  já feito hoje
    if (dia.lastCompletedDate === hoje) return;

    try {
      const resposta = await registrarTreinoDoDia();

      const xp = resposta?.xpEarned || 0;

      const novos = dias.map((d) =>
        d.id === id
          ? { ...d, lastCompletedDate: hoje }
          : d
      );

      await salvarDias(novos);

      //  POPUP XP
      if (xp > 0) {
        setXpGanho(xp);
        setModalXpVisible(true);

        await tocarXp();

        setTimeout(() => {
          setModalXpVisible(false);
        }, 3000);
      }

    } catch (err) {
      console.log('❌ erro ao concluir treino', err);
    }
  }

  /* =========================
     ➕ ADICIONAR EXERCÍCIO
  ========================= */
  async function adicionarExercicio(
    exercicio: any
  ) {

    if (!diaSelecionado) return;

    const novo = {
      id: Date.now().toString(),
      exercicio,
      series: 3,
      repeticoes: 10,
    };

    const novosDias = dias.map((d) => {

      if (d.id === diaSelecionado.id) {

        return {
          ...d,
          exercicios: [
            ...d.exercicios,
            novo,
          ],
        };
      }

      return d;
    });

    await salvarDias(novosDias);

    setDiaSelecionado((prev) =>
      prev
        ? {
          ...prev,
          exercicios: [
            ...prev.exercicios,
            novo,
          ],
        }
        : null
    );

    setModo('dia');
  }

  /* =========================
     ❌ REMOVER EXERCÍCIO
  ========================= */
  async function removerExercicio(
    itemId: string
  ) {

    if (!diaSelecionado) return;

    const novosDias = dias.map((d) => {

      if (d.id === diaSelecionado.id) {

        return {
          ...d,
          exercicios:
            d.exercicios.filter(
              (e) => e.id !== itemId
            ),
        };
      }

      return d;
    });

    await salvarDias(novosDias);

    setDiaSelecionado((prev) =>
      prev
        ? {
          ...prev,
          exercicios:
            prev.exercicios.filter(
              (e) => e.id !== itemId
            ),
        }
        : null
    );
  }

  /* =========================
     🔥 ATUALIZAR EXERCÍCIO
  ========================= */
  async function atualizarExercicio(
    id: string,
    series: number,
    repeticoes: number
  ) {

    if (!diaSelecionado) return;

    const novosDias = dias.map((d) => {

      if (d.id === diaSelecionado.id) {

        return {
          ...d,
          exercicios: d.exercicios.map((e) =>
            e.id === id
              ? {
                ...e,
                series,
                repeticoes,
              }
              : e
          ),
        };
      }

      return d;
    });

    await salvarDias(novosDias);

    setDiaSelecionado((prev) =>
      prev
        ? {
          ...prev,
          exercicios:
            prev.exercicios.map((e) =>
              e.id === id
                ? {
                  ...e,
                  series,
                  repeticoes,
                }
                : e
            ),
        }
        : null
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
    >

      {/* LISTA */}
      {modo === 'lista' && (
        <ListaTreinos
          dias={dias}
          selecionar={selecionarDia}
          concluirDia={concluirDia}
        />
      )}

      {/* DIA */}
      {modo === 'dia' &&
        diaSelecionado && (
          <TelaTreinoDia
            dia={diaSelecionado}
            voltar={voltarLista}
            irBuscar={irBuscar}
            removerExercicio={
              removerExercicio
            }
            atualizarExercicio={
              atualizarExercicio
            }
          />
        )}

      {/*  BUSCAR */}
      {modo === 'buscar' && (
        <TelaBuscarExercicio
          voltar={() => setModo('dia')}
          adicionar={
            adicionarExercicio
          }
        />
      )}

      {/* fallback */}
      {modo === 'dia' &&
        !diaSelecionado && (
          <View style={styles.center}>
            <Text
              style={{ color: 'white' }}
            >
              Nenhum dia selecionado
            </Text>
          </View>
        )}

      {/*POPUP XP */}
      <Modal visible={modalXpVisible} transparent animationType="fade">
        <View style={styles.popupBg}>
          <View style={styles.popupCard}>
            <Image
              source={require('@/assets/images/nutriagua.png')}
              style={styles.popupImage}
            />

            <Text style={styles.popupTitulo}>
              Treino concluído!
            </Text>

            <Text style={styles.popupTexto}>
              Parabéns! Você ganhou
            </Text>

            <Text style={styles.popupXp}>
              +{xpGanho} XP
            </Text>
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    justifyContent: 'center',
    alignItems: 'center',
  },

  popupBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  popupCard: {
    width: '85%',
    backgroundColor: '#1c1c1c',
    borderRadius: 28,
    paddingVertical: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4FC3F7',
    shadowColor: '#4FC3F7',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  popupImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 12,
  },

  popupTitulo: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },

  popupTexto: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
  },

  popupXp: {
    color: '#4CAF50',
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 12,
  },
});