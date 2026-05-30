import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Image,
  Animated,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { tocarXp } from "@/src/utils/xp/tocarXp";
import { useEffect, useMemo, useRef, useState } from "react";
import { getWaterLogs, saveWaterLog } from "@/src/services/waterService";
import { pegarPeso } from "@/src/utils/storage";

const BARRA_WIDTH  = 100;
const BARRA_HEIGHT = 180;

/* ── Ondinha SVG animada ── */
function Ondinha({
  progressoAnim,
}: {
  progressoAnim: Animated.Value;
}) {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const [nivelPx, setNivelPx] = useState(BARRA_HEIGHT);

  // Escuta o valor animado para recalcular o path SVG em tempo real
  useEffect(() => {
    const listener = progressoAnim.addListener(({ value }) => {
      setNivelPx(BARRA_HEIGHT * (1 - value));
    });
    return () => progressoAnim.removeListener(listener);
  }, []);

  // Loop horizontal da onda
  useEffect(() => {
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -BARRA_WIDTH],
  });

  // Dois ciclos da onda lado a lado → ao transladar um ciclo parece infinito
  const W = BARRA_WIDTH;
  const y = nivelPx;
  const waveD = [
    `M0,${y}`,
    `Q${W * 0.25},${y - 7} ${W * 0.5},${y}`,
    `Q${W * 0.75},${y + 7} ${W},${y}`,
    `Q${W * 1.25},${y - 7} ${W * 1.5},${y}`,
    `Q${W * 1.75},${y + 7} ${W * 2},${y}`,
    `L${W * 2},${BARRA_HEIGHT}`,
    `L0,${BARRA_HEIGHT}`,
    "Z",
  ].join(" ");

  if (nivelPx >= BARRA_HEIGHT) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: BARRA_WIDTH * 2,
        height: BARRA_HEIGHT,
        transform: [{ translateX }],
      }}
    >
      <Svg width={BARRA_WIDTH * 2} height={BARRA_HEIGHT}>
        <Path d={waveD} fill="#4FC3F7" opacity={0.9} />
      </Svg>
    </Animated.View>
  );
}

export default function TelaAgua() {
  const [ml, setMl]                         = useState(0);
  const [loading, setLoading]               = useState(true);
  const [meta, setMeta]                     = useState(2000);
  const [metaConcluida, setMetaConcluida]   = useState(false);
  const [dataConcluida, setDataConcluida]   = useState<string | null>(null);
  const [modalXpVisible, setModalXpVisible] = useState(false);
  const [xpGanho, setXpGanho]               = useState(0);

  const aguaAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const hoje            = new Date().toISOString().split("T")[0];
  const isBloqueadoHoje = metaConcluida && dataConcluida === hoje;

  /*  Carregamento inicial  */
  useEffect(() => {
    async function carregar() {
      try {
        const peso      = await pegarPeso();
        const metaAtual = Math.round((peso || 0) * 35);
        setMeta(metaAtual);
        const logs    = await getWaterLogs();
        const hojeLog = logs.find((l: any) => l.date === hoje);
        if (hojeLog) {
          setMl(hojeLog.milliliters);
          setMetaConcluida(!!hojeLog.isCompleted);
          if (hojeLog.isCompleted) setDataConcluida(hoje);
        }
      } catch (err) {
        console.log("❌ Erro ao buscar água:", err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const progresso   = useMemo(() => Math.min(ml / meta, 1), [ml, meta]);
  const porcentagem = Math.round(progresso * 100);
  const faltando    = Math.max(meta - ml, 0);

  /*  Anima nível da água  */
  useEffect(() => {
    Animated.timing(aguaAnim, {
      toValue: progresso,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progresso]);

  /* Glow meta concluída */
  useEffect(() => {
    if (!metaConcluida) {
      glowAnim.setValue(0);
      return;
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 700, useNativeDriver: false }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [metaConcluida]);

  const glowBorder = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", "#4FC3F7"],
  });
  const glowShadow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#000000", "#4FC3F7"],
  });

  /*  Salvar  */
  async function salvarAgua(valor: number) {
    if (isBloqueadoHoje) return;
    try {
      const bateuMeta = valor >= meta;
      let completed   = metaConcluida;
      if (bateuMeta && !metaConcluida) {
        completed = true;
        setMetaConcluida(true);
        setDataConcluida(hoje);
      }
      const resposta = await saveWaterLog({
        milliliters: valor,
        date: hoje,
        isCompleted: completed,
      });
      if (resposta?.xpEarned > 0) {
        setXpGanho(resposta.xpEarned);
        setModalXpVisible(true);
        await tocarXp();
        setTimeout(() => setModalXpVisible(false), 3000);
      }
    } catch (err) {
      console.log("❌ Erro ao salvar água:", err);
    }
  }

  async function adicionarAgua() {
    if (isBloqueadoHoje) return;
    const novo = ml + 250;
    setMl(novo);
    await salvarAgua(novo);
  }

  async function removerAgua() {
    if (isBloqueadoHoje) return;
    const novo = Math.max(ml - 250, 0);
    setMl(novo);
    await salvarAgua(novo);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4FC3F7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Hidratação</Text>
      <Text style={styles.subtitulo}>Mantenha seu corpo hidratado </Text>

      <Animated.View
        style={[
          styles.card,
          metaConcluida && {
            borderColor: glowBorder,
            shadowColor: glowShadow,
            shadowOpacity: 0.8,
            shadowRadius: 18,
            elevation: 16,
          },
        ]}
      >
        <View style={styles.barra}>
          <Ondinha progressoAnim={aguaAnim} />
        </View>

        <Text style={styles.ml}>{ml} ml</Text>
        <Text style={styles.meta}>Meta diária: {meta} ml</Text>
        <Text style={styles.porcentagem}>{porcentagem}% concluído</Text>
        {faltando > 0 ? (
          <Text style={styles.faltando}>Faltam {faltando} ml</Text>
        ) : (
          <Text style={styles.concluido}>
            {isBloqueadoHoje ? "Meta concluída (bloqueado hoje) 🔒" : "Meta concluída 🎉"}
          </Text>
        )}
      </Animated.View>

      <View style={styles.botoes}>
        <TouchableOpacity
          style={[styles.botaoRemover, isBloqueadoHoje && styles.botaoDesativado]}
          onPress={removerAgua}
          disabled={isBloqueadoHoje}
        >
          <Text style={styles.botaoTexto}>- 250 ml</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botaoAdicionar, isBloqueadoHoje && styles.botaoDesativado]}
          onPress={adicionarAgua}
          disabled={isBloqueadoHoje}
        >
          <Text style={styles.botaoTexto}>+ 250 ml</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalXpVisible} transparent animationType="fade">
        <View style={styles.popupBg}>
          <View style={styles.popupCard}>
            <Image
              source={require("@/assets/images/nutriagua.png")}
              style={styles.popupImage}
            />
            <Text style={styles.popupTitulo}>Meta concluída!</Text>
            <Text style={styles.popupTexto}>Parabéns! Você ganhou</Text>
            <Text style={styles.popupXp}>+{xpGanho} XP</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    flex: 1,
    backgroundColor: "#0f0f0f",
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  subtitulo: {
    color: "#aaa",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1c1c1c",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  barra: {
    marginTop: 25,
    width: BARRA_WIDTH,
    height: BARRA_HEIGHT,
    backgroundColor: "#333",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 15,
  },
  ml: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  meta: {
    color: "#aaa",
  },
  porcentagem: {
    color: "#4FC3F7",
    marginTop: 5,
  },
  faltando: {
    color: "#ffcc00",
    marginTop: 5,
  },
  concluido: {
    color: "#4CAF50",
    marginTop: 5,
  },
  botoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  botaoAdicionar: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 15,
    marginLeft: 10,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
  },
  botaoRemover: {
    flex: 1,
    backgroundColor: "#E53935",
    padding: 15,
    marginRight: 10,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
  },
  botaoTexto: {
    color: "white",
    fontWeight: "bold",
  },
  botaoDesativado: {
    opacity: 0.4,
  },
  popupBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popupCard: {
    width: "85%",
    backgroundColor: "#1c1c1c",
    borderRadius: 28,
    paddingVertical: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4FC3F7",
    shadowColor: "#4FC3F7",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  popupImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 12,
  },
  popupTitulo: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },
  popupTexto: {
    color: "#aaa",
    fontSize: 15,
    textAlign: "center",
  },
  popupXp: {
    color: "#4CAF50",
    fontSize: 34,
    fontWeight: "bold",
    marginTop: 12,
  },
});