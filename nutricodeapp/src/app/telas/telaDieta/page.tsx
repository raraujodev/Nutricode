import { useState, useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ListaRefeicoes from './ListaRefeicoes';
import TelaRefeicao from './TelaRefeicao';
import TelaBuscar from './TelaBuscar';
import {
  salvarRefeicoes,
  carregarRefeicoes,
} from '@/src/services/refeicaoServices';
import {
  pegarUsuario,
  pegarPeso,
} from '@/src/utils/storage';
import {
  registrarDietaDoDia
} from '@/src/services/dietaService';
import { tocarXp } from '@/src/utils/xp/tocarXp';
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
const getXpKey       = (uid: string) => `@nutricode:dieta_xp_date:${uid}`;
const getDietaDateKey = (uid: string) => `@nutricode:dieta_date:${uid}`;
export default function TelaDieta() {
  const [modo, setModo] =
    useState<'lista' | 'refeicao' | 'buscar'>('lista');
  const [refeicoes, setRefeicoes] =
    useState<Refeicao[]>([]);
  const refeicoesRef = useRef<Refeicao[]>([]);
  const [refeicaoSelecionada, setRefeicaoSelecionada] =
    useState<Refeicao | null>(null);
  const [userId, setUserId] =
    useState<string | null>(null);
  const [metaProteina, setMetaProteina] = useState(0);
  const [metaCalorias, setMetaCalorias] = useState(0);
  const [modalXpVisible, setModalXpVisible] = useState(false);
  const xpGanhoRef = useRef(0);
  const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ultimaDataXP, setUltimaDataXP] = useState<string | null>(null);
  const hoje = new Date().toISOString().split('T')[0];
  refeicoesRef.current = refeicoes;
  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);
  /*  LOAD & RESET UNIFICADO  */
  useEffect(() => {
    async function init() {
      const user = await pegarUsuario();
      const id = user?.id || user?.userId;
      if (!id) return;
      setUserId(id);
      const XP_KEY        = getXpKey(id);
      const DIETA_DATE_KEY = getDietaDateKey(id);
      const peso = await pegarPeso();
      if (peso) {
        setMetaProteina(Math.round(peso * 2));
        setMetaCalorias(Math.round(peso * 33));
      }
      const dados = await carregarRefeicoes(id);
      if (dados.length === 0) {
        const padrao: Refeicao[] = [
          { id: '1', nome: 'Café da manhã', alimentos: [], concluida: false },
          { id: '2', nome: 'Almoço',        alimentos: [], concluida: false },
          { id: '3', nome: 'Janta',         alimentos: [], concluida: false },
        ];
        setRefeicoes(padrao);
        await salvarRefeicoes(id, padrao);
        await AsyncStorage.setItem(DIETA_DATE_KEY, hoje);
        return;
      }
      const ultimoDia = await AsyncStorage.getItem(DIETA_DATE_KEY);
      if (ultimoDia !== hoje) {
      
        const resetadas = dados.map((r: Refeicao) => ({ ...r, concluida: false }));
        await salvarRefeicoes(id, resetadas);
        setRefeicoes(resetadas);
        await AsyncStorage.setItem(DIETA_DATE_KEY, hoje);
        await AsyncStorage.removeItem(XP_KEY);
        setUltimaDataXP(null);
      } else {
        setRefeicoes(dados);
     
        const lockAtual = await AsyncStorage.getItem(XP_KEY);
        if (lockAtual === hoje) {
          setUltimaDataXP(hoje);
        }
      }
    }
    init();
  }, []);
  /*  SAVE  */
  async function atualizarRefeicoes(novas: Refeicao[]) {
    if (!userId) return;
    refeicoesRef.current = novas;
    setRefeicoes(novas);
    await salvarRefeicoes(userId, novas);
  }
  /*  MOSTRAR POPUP  */
  function mostrarPopupXp(xp: number) {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }
    xpGanhoRef.current = xp;
    setModalXpVisible(true);
    popupTimerRef.current = setTimeout(() => {
      setModalXpVisible(false);
      popupTimerRef.current = null;
    }, 3000);
  }
  /*  VERIFICAR E ENVIAR XP  */
  async function verificarEEnviarXp(novas: Refeicao[]) {
    if (!userId) return;
    const XP_KEY = getXpKey(userId);
  
    const lockSalvo = await AsyncStorage.getItem(XP_KEY);
    if (lockSalvo === hoje) return;
    if (novas.length === 0) return;
    const refeicoesCandidatas = novas.filter((r) => r.alimentos.length > 0);
    if (refeicoesCandidatas.length === 0) return;
    const todasConcluidas = refeicoesCandidatas.every((r) => r.concluida);
    if (!todasConcluidas) return;
    try {
    
      const resposta = await registrarDietaDoDia();
      const xp = resposta?.xpEarned || 0;
      await tocarXp();
      await AsyncStorage.setItem(XP_KEY, hoje);
      setUltimaDataXP(hoje);
      mostrarPopupXp(xp);
    } catch (err) {
      console.log('❌ Erro ao registrar dieta:', err);
    
    }
  }
  /*  ADICIONAR REFEIÇÃO  */
  async function adicionarRefeicao() {
    if (!userId) return;
    if (refeicoes.length >= 6) return;
    const nova: Refeicao = {
      id: Date.now().toString(),
      nome: `Refeição ${refeicoes.length + 1}`,
      alimentos: [],
      concluida: false,
    };
    const novas = [...refeicoes, nova];
    await atualizarRefeicoes(novas);
  }
  /*  SELECIONAR REFEIÇÃO */
  function selecionarRefeicao(refeicao: Refeicao) {
    const atualizada = refeicoes.find((r) => r.id === refeicao.id) ?? refeicao;
    setRefeicaoSelecionada(atualizada);
    setModo('refeicao');
  }
  /*  ADICIONAR ALIMENTO  */
  async function adicionarAlimento(alimento: any) {
    if (!refeicaoSelecionada) return;
    const novoItem: Item = {
      id: Date.now().toString(),
      alimento,
      quantidade: 100,
    };
    const novas = refeicoes.map((r) => {
      if (r.id === refeicaoSelecionada.id) {
        return {
          ...r,
          alimentos: [...r.alimentos, novoItem],
          concluida: false,
        };
      }
      return r;
    });
    await atualizarRefeicoes(novas);
    setRefeicaoSelecionada((prev) =>
      prev
        ? { ...prev, alimentos: [...prev.alimentos, novoItem], concluida: false }
        : null
    );
    setModo('refeicao');
  }
  /*  REMOVER ALIMENTO */
  async function removerAlimento(itemId: string) {
    if (!refeicaoSelecionada) return;
    const novas = refeicoes.map((r) => {
      if (r.id === refeicaoSelecionada.id) {
        return {
          ...r,
          alimentos: r.alimentos.filter((i) => i.id !== itemId),
          concluida: false,
        };
      }
      return r;
    });
    await atualizarRefeicoes(novas);
    setRefeicaoSelecionada((prev) =>
      prev
        ? {
            ...prev,
            alimentos: prev.alimentos.filter((i) => i.id !== itemId),
            concluida: false,
          }
        : null
    );
  }
  /* ATUALIZAR NOME  */
  async function atualizarNomeRefeicao(id: string, novoNome: string) {
    const novas = refeicoes.map((r) =>
      r.id === id ? { ...r, nome: novoNome } : r
    );
    await atualizarRefeicoes(novas);
    if (refeicaoSelecionada?.id === id) {
      setRefeicaoSelecionada((prev) =>
        prev ? { ...prev, nome: novoNome } : null
      );
    }
  }
  /*  REMOVER REFEIÇÃO  */
  async function removerRefeicao(id: string) {
    const novas = refeicoes.filter((r) => r.id !== id);
    await atualizarRefeicoes(novas);
    if (refeicaoSelecionada?.id === id) {
      setModo('lista');
      setRefeicaoSelecionada(null);
    }
    await verificarEEnviarXp(novas);
  }
  /*  ATUALIZAR QUANTIDADE */
  async function atualizarQuantidade(itemId: string, novaQtd: number) {
    if (!refeicaoSelecionada) return;
    const novas = refeicoes.map((r) => {
      if (r.id === refeicaoSelecionada.id) {
        return {
          ...r,
          alimentos: r.alimentos.map((i) =>
            i.id === itemId ? { ...i, quantidade: novaQtd } : i
          ),
        };
      }
      return r;
    });
    await atualizarRefeicoes(novas);
    setRefeicaoSelecionada((prev) =>
      prev
        ? {
            ...prev,
            alimentos: prev.alimentos.map((i) =>
              i.id === itemId ? { ...i, quantidade: novaQtd } : i
            ),
          }
        : null
    );
  }
  /*  CONCLUIR / DESCONCLUIR  */
  async function concluirRefeicao(id: string) {
    const refeicoesAtuais = refeicoesRef.current;
    const refeicaoAtual = refeicoesAtuais.find((r) => r.id === id);
    if (!refeicaoAtual) return;
    if (refeicaoAtual.concluida) {
      const novas = refeicoesAtuais.map((r) =>
        r.id === id ? { ...r, concluida: false } : r
      );
      await atualizarRefeicoes(novas);
      return;
    }
    if (refeicaoAtual.alimentos.length === 0) {
      Alert.alert(
        'Refeição vazia',
        'Adicione alimentos antes de concluir a refeição.'
      );
      return;
    }
    const novas = refeicoesAtuais.map((r) =>
      r.id === id ? { ...r, concluida: true } : r
    );
    await atualizarRefeicoes(novas);
    await verificarEEnviarXp(novas);
  }
  /* TOTAIS DO DIA  */
  const totaisDia = refeicoes.reduce(
    (acc, ref) => {
      ref.alimentos.forEach((item) => {
        const fator = item.quantidade / 100;
        acc.kcal  += item.alimento.kcal           * fator;
        acc.prot  += item.alimento.protein         * fator;
        acc.carb  += item.alimento.carbohydrates   * fator;
        acc.gord  += item.alimento.lipids          * fator;
        acc.fibra += item.alimento.dietaryFiber    * fator;
      });
      return acc;
    },
    { kcal: 0, prot: 0, carb: 0, gord: 0, fibra: 0 }
  );
  const totaisComMeta = {
    kcal:  Math.round(totaisDia.kcal),
    prot:  Math.round(totaisDia.prot),
    carb:  Math.round(totaisDia.carb),
    gord:  Math.round(totaisDia.gord),
    fibra: Math.round(totaisDia.fibra),
  };
  /*  RENDER  */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={20}
    >
      {modo === 'lista' && (
        <ListaRefeicoes
          refeicoes={refeicoes}
          selecionar={selecionarRefeicao}
          adicionarRefeicao={adicionarRefeicao}
          metaProteina={metaProteina}
          metaCalorias={metaCalorias}
          concluirRefeicao={concluirRefeicao}
          atualizarNomeRefeicao={atualizarNomeRefeicao}
          removerRefeicao={removerRefeicao}
          totaisDia={totaisComMeta}
        />
      )}
      {modo === 'refeicao' && (
        refeicaoSelecionada ? (
          <TelaRefeicao
            refeicao={refeicaoSelecionada}
            voltar={() => setModo('lista')}
            irBuscar={() => setModo('buscar')}
            removerAlimento={removerAlimento}
            atualizarQuantidade={atualizarQuantidade}
            concluirRefeicao={concluirRefeicao}
          />
        ) : (
          <View style={styles.center}>
            <Text style={{ color: 'white' }}>
              Nenhuma refeição selecionada
            </Text>
          </View>
        )
      )}
      {modo === 'buscar' && (
        <TelaBuscar
          voltar={() => setModo('refeicao')}
          adicionar={adicionarAlimento}
        />
      )}
      <Modal visible={modalXpVisible} transparent animationType="fade">
        <View style={styles.popupBg}>
          <View style={styles.popupCard}>
            <Image
              source={require('@/assets/images/nutricomidaxp.png')}
              style={styles.popupImage}
            />
            <Text style={styles.popupTitulo}>
              Meta de dieta concluída!
            </Text>
            <Text style={styles.popupTexto}>
              Você ganhou
            </Text>
            <Text style={styles.popupXp}>
              +{xpGanhoRef.current} XP
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
  },
  popupCard: {
    width: '85%',
    backgroundColor: '#1c1c1c',
    borderRadius: 28,
    paddingVertical: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  popupImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  popupTitulo: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  popupTexto: {
    color: '#aaa',
  },
  popupXp: {
    color: '#4CAF50',
    fontSize: 32,
    fontWeight: 'bold',
  },
});