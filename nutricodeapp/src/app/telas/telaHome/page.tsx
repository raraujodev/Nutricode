import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Animated,
} from "react-native";
import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useFocusEffect } from "expo-router";
import { LineChart, BarChart } from "react-native-chart-kit";
import { pegarUsuario, pegarPeso, salvarPeso } from "@/src/utils/storage";
import { getUserInfo, updateUserInfo } from "@/src/services/userService";
import { getProgression } from "@/src/services/progressionService";
import { getRegistrosPeso, salvarRegistroPeso } from "@/src/services/pesoService";
import { getTreinosRealizados } from "@/src/services/treinoRealizadoService";
import { getWaterLogs } from "@/src/services/waterService";
import { getDietaRealizada } from "@/src/services/dietaService";
import { createDietaStore } from "@/src/store/dietaStore";

const screenWidth = Dimensions.get("window").width;
const MAX_LEVEL   = 30;

/* ========================= STREAK CARD COM GLOW ========================= */
function StreakCard({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const isMid  = value >= 7  && value <= 13;
  const isHigh = value >= 14;
  const isHot  = isMid || isHigh;

  useEffect(() => {
    if (!isHot) { anim.setValue(0); return; }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 600, useNativeDriver: false }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isHot]);

  const [colorA, colorB] = isMid ? ["#FF9500", "#FFFFFF"] : ["#FF3B30", "#FF9500"];
  const animatedColor = anim.interpolate({ inputRange: [0, 1], outputRange: [colorA, colorB] });

  return (
    <Animated.View style={[styles.streakCard, isHot && { borderColor: animatedColor }]}>
      <Text style={styles.streakEmoji}>{emoji}</Text>
      {isHot ? (
        <Animated.Text style={[styles.streakValue, { color: animatedColor }]}>{value}</Animated.Text>
      ) : (
        <Text style={[styles.streakValue, { color: "white" }]}>{value}</Text>
      )}
      <Text style={styles.streakLabel}>{label}</Text>
    </Animated.View>
  );
}

/* ========================= BARRA DE XP ========================= */
function XpBar({ xp, nextXp, level }: { xp: number; nextXp: number; level: number }) {
  const isMax   = level >= MAX_LEVEL;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const xpAnim   = useRef(new Animated.Value(0)).current;

  const progresso = isMax ? 1 : (nextXp > 0 ? Math.min(xp / nextXp, 1) : 0);

  // Anima o preenchimento
  useEffect(() => {
    Animated.timing(xpAnim, {
      toValue: progresso,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progresso]);

  // Glow verde ↔ branco quando MAX
  useEffect(() => {
    if (!isMax) { glowAnim.setValue(0); return; }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(glowAnim, { toValue: 0, duration: 700, useNativeDriver: false }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isMax]);

  const fillColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#4CAF50", "#FFFFFF"],
  });

  return (
    <>
      <View style={styles.xpBar}>
        <Animated.View
          style={[
            styles.xpFill,
            {
              width: xpAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
              backgroundColor: isMax ? fillColor : "#4CAF50",
            },
          ]}
        />
      </View>
      <Text style={styles.xpText}>
        {isMax ? "MAX / MAX" : `${xp} / ${nextXp} XP`}
      </Text>
    </>
  );
}

export default function TelaHome() {
  const [usuario, setUsuario]           = useState<any>(null);
  const [peso, setPeso]                 = useState<number>(0);
  const [altura, setAltura]             = useState<number>(0);
  const [idade, setIdade]               = useState<number>(0);
  const [sexo, setSexo]                 = useState<string>("");
  const [metaAgua, setMetaAgua]         = useState(0);
  const [metaProteina, setMetaProteina] = useState(0);
  const [metaCalorias, setMetaCalorias] = useState(0);
  const [level, setLevel]               = useState(1);
  const [xp, setXp]                     = useState(0);
  const [nextXp, setNextXp]             = useState(100);
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const [waterStreak, setWaterStreak]     = useState(0);
  const [dietStreak, setDietStreak]       = useState(0);
  const [pesoGrafico, setPesoGrafico]   = useState<number[]>([]);
  const [pesoLabels, setPesoLabels]     = useState<string[]>([]);
  const [treinoGrafico, setTreinoGrafico] = useState<number[]>([]);
  const [treinoLabels, setTreinoLabels]   = useState<string[]>([]);
  const [aguaGrafico, setAguaGrafico]   = useState<number[]>([]);
  const [aguaLabels, setAguaLabels]     = useState<string[]>([]);
  const [dietaGrafico, setDietaGrafico] = useState<number[]>([]);
  const [dietaLabels, setDietaLabels]   = useState<string[]>([]);
  const [expandido, setExpandido]       = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [campoEditando, setCampoEditando] = useState("");
  const [valorEditando, setValorEditando] = useState("");
  const [carregou, setCarregou]         = useState(false);
  const carregando = useRef(false);

  async function carregar() {
    if (carregando.current) return;
    carregando.current = true;
    setCarregou(false);
    try {
      const user = await pegarUsuario();
      if (!user?.id) return;
      setUsuario(user);
      const userId = user.id || user.userId;
      const dietaStore   = createDietaStore(userId);
      const definirMetas = dietaStore.getState().definirMetas;
      const [info, progression, registrosPeso, treinos, aguaRealizada, dietaRealizada] = await Promise.all([
        getUserInfo(userId),
        getProgression(userId),
        getRegistrosPeso(userId),
        getTreinosRealizados(userId),
        getWaterLogs().catch(() => []),
        getDietaRealizada(userId).catch(() => []),
      ]);
      if (info) {
        setAltura(info.height || 0);
        setIdade(info.age || 0);
        setSexo(info.sex === "MALE" ? "Masculino" : "Feminino");
      }
      let pesoAtual = 0;
      let registrosParaGrafico = registrosPeso || [];
      if (registrosParaGrafico.length > 0) {
        const registroMaisRecente = [...registrosParaGrafico].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        pesoAtual = registroMaisRecente.weight;
        setPeso(pesoAtual);
        await salvarPeso(pesoAtual);
      } else {
        const pesoSalvo = await pegarPeso();
        pesoAtual = pesoSalvo || 0;
        setPeso(pesoAtual);
        if (pesoAtual > 0) {
          const hoje = new Date().toISOString().split("T")[0];
          await salvarRegistroPeso(userId, { weight: pesoAtual, date: hoje });
          registrosParaGrafico = [{ weight: pesoAtual, date: hoje }];
        }
      }
      const metaAguaCalculada     = Math.round(pesoAtual * 35);
      const metaProteinaCalculada = Math.round(pesoAtual * 2);
      const metaCaloriasCalculada = Math.round(pesoAtual * 33);
      setMetaAgua(metaAguaCalculada);
      setMetaProteina(metaProteinaCalculada);
      setMetaCalorias(metaCaloriasCalculada);
      definirMetas({
        calorias:    metaCaloriasCalculada,
        proteina:    metaProteinaCalculada,
        carboidrato: Math.round(pesoAtual * 4),
        gordura:     Math.round(pesoAtual * 0.8),
      });
      if (progression) {
        setLevel(progression.level || 1);
        setXp(progression.xp || 0);
        setNextXp(progression.nextLevelRequirement || 100);
        setWorkoutStreak(progression.currentWorkoutStreak || 0);
        setWaterStreak(progression.currentWaterStreak || 0);
        setDietStreak(progression.currentDietStreak || 0);
      }
      if (registrosParaGrafico.length > 0) {
        const reversed = [...registrosParaGrafico].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setPesoGrafico(reversed.map((i) => i.weight));
        setPesoLabels(reversed.map((i) => i.date.slice(5)));
      } else {
        setPesoGrafico([]);
        setPesoLabels([]);
      }
      if (treinos && treinos.length > 0) {
        const semanas: { [key: string]: number } = {};
        treinos.forEach((item) => {
          if (!item.isFinished) return;
          const data = new Date(item.date);
          const inicioAno = new Date(data.getFullYear(), 0, 1);
          const dias = Math.floor((data.getTime() - inicioAno.getTime()) / 86400000);
          const semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);
          const chave = `${semana}ª Sem`;
          semanas[chave] = (semanas[chave] || 0) + 1;
        });
        const ord = Object.entries(semanas).sort(
          ([a], [b]) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))
        );
        setTreinoLabels(ord.map(([l]) => l));
        setTreinoGrafico(ord.map(([, v]) => v));
      } else {
        setTreinoGrafico([]);
        setTreinoLabels([]);
      }
      if (aguaRealizada && aguaRealizada.length > 0) {
        const semanas: { [key: string]: number } = {};
        aguaRealizada.forEach((item: any) => {
          if (!item.isCompleted) return;
          const data = new Date(item.date);
          const inicioAno = new Date(data.getFullYear(), 0, 1);
          const dias = Math.floor((data.getTime() - inicioAno.getTime()) / 86400000);
          const semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);
          const chave = `${semana}ª Sem`;
          semanas[chave] = (semanas[chave] || 0) + 1;
        });
        const ord = Object.entries(semanas).sort(
          ([a], [b]) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))
        );
        setAguaLabels(ord.map(([l]) => l));
        setAguaGrafico(ord.map(([, v]) => v));
      } else {
        setAguaGrafico([]);
        setAguaLabels([]);
      }
      if (dietaRealizada && dietaRealizada.length > 0) {
        const semanas: { [key: string]: number } = {};
        dietaRealizada.forEach((item: any) => {
          if (!item.isFinished) return;
          const data = new Date(item.date);
          const inicioAno = new Date(data.getFullYear(), 0, 1);
          const dias = Math.floor((data.getTime() - inicioAno.getTime()) / 86400000);
          const semana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);
          const chave = `${semana}ª Sem`;
          semanas[chave] = (semanas[chave] || 0) + 1;
        });
        const ord = Object.entries(semanas).sort(
          ([a], [b]) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))
        );
        setDietaLabels(ord.map(([l]) => l));
        setDietaGrafico(ord.map(([, v]) => v));
      } else {
        setDietaGrafico([]);
        setDietaLabels([]);
      }
      setCarregou(true);
    } catch (err) {
      console.log("❌ Erro Home:", err);
    } finally {
      carregando.current = false;
    }
  }

  useFocusEffect(useCallback(() => { carregar(); return () => {}; }, []));

  function abrirEditor(campo: string, valor: string) {
    setCampoEditando(campo);
    setValorEditando(valor);
    setModalVisible(true);
  }

  async function salvarAlteracao() {
    try {
      const userId = usuario?.id || usuario?.userId;
      if (!userId) return;
      if (campoEditando === "peso") {
        const novoPeso = Number(valorEditando);
        await salvarPeso(novoPeso);
        const hoje = new Date().toISOString().split("T")[0];
        await salvarRegistroPeso(userId, { weight: novoPeso, date: hoje });
        setPeso(novoPeso);
        setMetaAgua(Math.round(novoPeso * 35));
        setMetaProteina(Math.round(novoPeso * 2));
        setMetaCalorias(Math.round(novoPeso * 33));
        await carregar();
      }
      if (campoEditando === "altura") {
        const novaAltura = Number(valorEditando);
        const infoAtual  = await getUserInfo(userId);
        await updateUserInfo(userId, { height: novaAltura, sex: infoAtual?.sex || "MALE", birthDate: "2000-01-01" });
        setAltura(novaAltura);
        setModalVisible(false);
        await carregar();
        return;
      }
      if (campoEditando === "sexo") {
        const sexoApi = valorEditando === "Masculino" ? "MALE" : "FEMALE";
        await updateUserInfo(userId, { sex: sexoApi });
        setSexo(valorEditando);
        setModalVisible(false);
        await carregar();
        return;
      }
      setModalVisible(false);
    } catch (err) {
      console.log("❌ Erro editar:", err);
    }
  }

  function getMascote(): { source: any; style: object } {
    if (level >= 30) return { source: require("@/assets/images/nutrinivel5.png"), style: {} };
    if (level >= 20) return { source: require("@/assets/images/nutrinivel5.png"), style: {} };
    if (level >= 15) return { source: require("@/assets/images/nutrinivel4.png"), style: {} };
    if (level >= 10) return { source: require("@/assets/images/nutrinivel3.png"), style: {} };
    if (level >= 5)  return { source: require("@/assets/images/nutrinivel2.png"), style: {} };
    return { source: require("@/assets/images/nutrinivel1.png"), style: { marginLeft: 9, width: 400, height: 400 } };
  }

  if (!carregou) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "white", fontSize: 18 }}>Carregando...</Text>
      </View>
    );
  }

  const mascote = getMascote();
  const isMax   = level >= MAX_LEVEL;

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.bemvindo}>Bem-vindo</Text>
          <Text style={styles.nome}>{usuario?.username || "Usuário"}</Text>
        </View>

        {/* MASCOTE */}
        <View style={styles.mascoteArea}>
          <View style={styles.mascoteCircle}>
            <Image source={mascote.source} style={[styles.mascote, mascote.style]} />
          </View>
          <Text style={[styles.level, isMax && styles.levelMax]}>
            {isMax ? `Level Máximo` : `Level ${level}`}
          </Text>
          <XpBar xp={xp} nextXp={nextXp} level={level} />
        </View>

        {/* INFO */}
        <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => setExpandido(!expandido)}>
          <View style={styles.infoHeader}>
            <Text style={styles.cardTitle}>Informações Básicas</Text>
            <Text style={styles.expandir}>{expandido ? "▲" : "▼"}</Text>
          </View>
          {expandido && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Sexo</Text>
                <Text style={styles.value}>{sexo}</Text>
              </View>
              <TouchableOpacity style={styles.infoRow} onPress={() => abrirEditor("altura", altura.toString())}>
                <Text style={styles.label}>Altura</Text>
                <Text style={styles.value}>{altura} cm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.infoRow} onPress={() => abrirEditor("peso", peso.toString())}>
                <Text style={styles.label}>Peso</Text>
                <Text style={styles.value}>{peso} kg</Text>
              </TouchableOpacity>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Idade</Text>
                <Text style={styles.value}>{idade} anos</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* METAS */}
        <Text style={styles.sectionTitle}>Metas Diárias</Text>
        <View style={styles.metaCard}>
          <Text style={styles.emoji}>💧</Text>
          <View>
            <Text style={styles.metaTitle}>Meta Hídrica</Text>
            <Text style={styles.metaValue}>{metaAgua} ml</Text>
          </View>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.emoji}>🍗</Text>
          <View>
            <Text style={styles.metaTitle}>Meta Proteica</Text>
            <Text style={styles.metaValue}>{metaProteina} g</Text>
          </View>
        </View>
        <View style={styles.metaCard}>
          <Text style={styles.emoji}>🔥</Text>
          <View>
            <Text style={styles.metaTitle}>Meta Calórica</Text>
            <Text style={styles.metaValue}>{metaCalorias} kcal</Text>
          </View>
        </View>

        {/* STREAKS */}
        <Text style={styles.sectionTitle}>Sequências</Text>
        <View style={styles.streakContainer}>
          <StreakCard emoji="🏋️" value={workoutStreak} label="Treino" />
          <StreakCard emoji="💧" value={waterStreak}   label="Água"   />
          <StreakCard emoji="🥗" value={dietStreak}    label="Dieta"  />
        </View>

        {/* GRÁFICO PESO */}
        <Text style={styles.sectionTitle}>Evolução de Peso</Text>
        {pesoGrafico.length > 0 && (
          <View style={styles.chartCard}>
            <LineChart
              data={{ labels: pesoLabels, datasets: [{ data: pesoGrafico }] }}
              width={screenWidth - 40}
              height={220}
              yAxisSuffix="kg"
              chartConfig={{
                backgroundColor: "#1c1c1c",
                backgroundGradientFrom: "#1c1c1c",
                backgroundGradientTo: "#1c1c1c",
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                propsForDots: { r: "5", strokeWidth: "2", stroke: "#4CAF50" },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* GRÁFICO TREINOS */}
        <Text style={styles.sectionTitle}>Treinos Concluídos</Text>
        {treinoGrafico.length > 0 && (
          <View style={styles.chartCard}>
            <BarChart
              data={{ labels: treinoLabels, datasets: [{ data: treinoGrafico }] }}
              width={screenWidth - 40}
              height={220}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#1c1c1c",
                backgroundGradientFrom: "#1c1c1c",
                backgroundGradientTo: "#1c1c1c",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
              }}
              style={styles.chart}
            />
          </View>
        )}

        {/* GRÁFICO ÁGUA */}
        <Text style={styles.sectionTitle}>Metas de Água Concluídas</Text>
        {aguaGrafico.length > 0 && (
          <View style={styles.chartCard}>
            <BarChart
              data={{ labels: aguaLabels, datasets: [{ data: aguaGrafico }] }}
              width={screenWidth - 40}
              height={220}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#1c1c1c",
                backgroundGradientFrom: "#1c1c1c",
                backgroundGradientTo: "#1c1c1c",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
              }}
              style={styles.chart}
            />
          </View>
        )}

        {/* GRÁFICO DIETA */}
        <Text style={styles.sectionTitle}>Dietas Concluídas</Text>
        {dietaGrafico.length > 0 && (
          <View style={styles.chartCard}>
            <BarChart
              data={{ labels: dietaLabels, datasets: [{ data: dietaGrafico }] }}
              width={screenWidth - 40}
              height={220}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#1c1c1c",
                backgroundGradientFrom: "#1c1c1c",
                backgroundGradientTo: "#1c1c1c",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
              }}
              style={styles.chart}
            />
          </View>
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Editar {campoEditando}</Text>
            <TextInput
              value={valorEditando}
              onChangeText={setValorEditando}
              style={styles.input}
              placeholder="Digite..."
              placeholderTextColor="#777"
            />
            <TouchableOpacity style={styles.salvarBtn} onPress={salvarAlteracao}>
              <Text style={styles.salvarText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#0f0f0f", paddingHorizontal: 20 },
  header:          { marginTop: 70, marginBottom: 30 },
  bemvindo:        { color: "#aaa", fontSize: 17 },
  nome:            { color: "white", fontSize: 34, fontWeight: "bold", marginTop: 4 },
  mascoteArea:     { alignItems: "center", marginBottom: 35 },
  mascoteCircle:   { width: 150, height: 150, borderRadius: 999, overflow: "hidden", justifyContent: "center", alignItems: "center", backgroundColor: "#1c1c1c", borderWidth: 3, borderColor: "#4CAF50" },
  mascote:         { width: 400, height: 400, resizeMode: "contain" },
  level:           { color: "#4CAF50", fontSize: 22, fontWeight: "bold", marginBottom: 12, marginTop: 15 },
  levelMax:        { color: "#FFD700", fontSize: 24 },
  xpBar:           { width: "100%", height: 14, backgroundColor: "#1c1c1c", borderRadius: 999, overflow: "hidden" },
  xpFill:          { height: "100%", backgroundColor: "#4CAF50" },
  xpText:          { color: "#aaa", marginTop: 8, fontSize: 14 },
  card:            { backgroundColor: "#1c1c1c", borderRadius: 22, padding: 22, marginBottom: 30 },
  infoHeader:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  expandir:        { color: "#4CAF50", fontSize: 18, fontWeight: "bold" },
  cardTitle:       { color: "white", fontSize: 21, fontWeight: "bold" },
  infoRow:         { flexDirection: "row", justifyContent: "space-between", marginTop: 18 },
  label:           { color: "#aaa", fontSize: 15 },
  value:           { color: "white", fontWeight: "600", fontSize: 15 },
  sectionTitle:    { color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 18, marginTop: 10 },
  metaCard:        { backgroundColor: "#1c1c1c", borderRadius: 20, padding: 18, marginBottom: 14, flexDirection: "row", alignItems: "center", gap: 15 },
  emoji:           { fontSize: 34 },
  metaTitle:       { color: "#aaa", fontSize: 15, marginBottom: 4 },
  metaValue:       { color: "white", fontSize: 24, fontWeight: "bold" },
  streakContainer: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 30 },
  streakCard:      { flex: 1, backgroundColor: "#1c1c1c", borderRadius: 20, paddingVertical: 20, alignItems: "center", borderWidth: 1.5, borderColor: "transparent" },
  streakEmoji:     { fontSize: 28, marginBottom: 10 },
  streakValue:     { fontSize: 26, fontWeight: "bold" },
  streakLabel:     { color: "#aaa", marginTop: 6, fontSize: 13 },
  chartCard:       { backgroundColor: "#1c1c1c", borderRadius: 24, paddingVertical: 16, marginBottom: 30, overflow: "hidden" },
  chart:           { borderRadius: 20, alignSelf: "center" },
  modalBg:         { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: 24 },
  modal:           { width: "100%", backgroundColor: "#1c1c1c", borderRadius: 24, padding: 24 },
  modalTitle:      { color: "white", fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input:           { backgroundColor: "#2a2a2a", borderRadius: 14, padding: 16, color: "white", marginBottom: 20, borderWidth: 1, borderColor: "#3a3a3a" },
  salvarBtn:       { backgroundColor: "#4CAF50", padding: 16, borderRadius: 14, alignItems: "center", marginBottom: 14 },
  salvarText:      { color: "white", fontWeight: "bold", fontSize: 16 },
  cancelar:        { color: "#aaa", textAlign: "center", fontSize: 15 },
});