import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";

import { useState, useEffect } from "react";
import { useRouter } from "expo-router";

import DateTimePicker from "@react-native-community/datetimepicker";

import {
  pegarUsuario,
  salvarOnboardingFeito,
  salvarPeso,
} from "@/src/utils/storage";

import { updateUserInfo } from "@/src/services/userService";

const { width } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);

  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");

  const [sexo, setSexo] =
    useState<"MALE" | "FEMALE" | null>(null);

  const [data, setData] = useState<Date | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const [atividade, setAtividade] = useState("");
  const [objetivo, setObjetivo] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const user = await pegarUsuario();

      if (user?.userId) {
        setUserId(user.userId);
      } else if (user?.id) {
        setUserId(user.id);
      }
    }

    load();
  }, []);

  function formatarData(date: Date) {
    return date.toISOString().split("T")[0];
  }

  async function finalizar() {
    if (!userId) {
      console.log("❌ userId null");
      return;
    }

    if (!data || !altura || !peso || !sexo) {
      console.log("❌ dados incompletos");
      return;
    }

    setLoading(true);

    try {
      /* =========================
         SALVA INFO BACKEND
      ========================= */
      await updateUserInfo(userId, {
        height: Number(altura),
        birthDate: formatarData(data),
        sex: sexo,
      });

      /* =========================
         SALVA PESO LOCALMENTE
      ========================= */
      await salvarPeso(Number(peso));

      /* =========================
         FINALIZA ONBOARDING
      ========================= */
      await salvarOnboardingFeito();

      router.replace("/telas/telaHome/page");

    } catch (err) {
      console.log("Erro onboarding:", err);
    } finally {
      setLoading(false);
    }
  }

  function renderMascote(texto: string) {
    return (
      <View style={styles.mascoteContainer}>
        <Image
          source={require("@/assets/images/nutri-onboard.png")}
          style={styles.mascote}
        />

        <View style={styles.balao}>
          <Text style={styles.balaoTexto}>
            {texto}
          </Text>
        </View>
      </View>
    );
  }

  /* =========================
    1
  ========================= */

  if (step === 1) {
    return (

      <KeyboardAvoidingView
        style={{
          flex: 1,
          backgroundColor: "#0f0f0f",
        }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
        keyboardVerticalOffset={
          Platform.OS === "ios"
            ? 40
            : 0
        }
      >

        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.scroll,
            {
              flexGrow: 1,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.content}>

            {renderMascote(
              "Olá! Eu sou o Nutri 🐼\nVamos configurar seu perfil rapidinho!"
            )}

            <Text style={styles.title}>
              Informações Básicas
            </Text>

            <Text style={styles.subtitle}>
              Isso ajuda a definir suas metas
              e alcançar seus resultados!
            </Text>

            {/* ALTURA */}
            <TextInput
              placeholder="Altura (cm)"
              placeholderTextColor="#777"
              value={altura}
              onChangeText={setAltura}
              keyboardType="numeric"
              style={styles.input}
            />

            {/* PESO */}
            <TextInput
              placeholder="Peso (kg)"
              placeholderTextColor="#777"
              value={peso}
              onChangeText={setPeso}
              keyboardType="numeric"
              style={styles.input}
            />

            {/* DATA */}
            <TouchableOpacity
              style={styles.input}
              onPress={() =>
                setMostrarPicker(true)
              }
            >

              <Text
                style={{
                  color:
                    data
                      ? "white"
                      : "#777",
                }}
              >
                {data
                  ? formatarData(data)
                  : "Data de nascimento"}
              </Text>

            </TouchableOpacity>

            {mostrarPicker && (
              <DateTimePicker
                value={
                  data ||
                  new Date(2000, 0, 1)
                }
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(
                  event,
                  selectedDate
                ) => {

                  setMostrarPicker(false);

                  if (selectedDate) {
                    setData(selectedDate);
                  }
                }}
              />
            )}

            {/* SEXO */}
            <View style={styles.row}>

              <TouchableOpacity
                style={[
                  styles.option,
                  sexo === "MALE" &&
                  styles.selected,
                ]}
                onPress={() =>
                  setSexo("MALE")
                }
              >
                <Text style={styles.optionText}>
                  Masculino
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.option,
                  sexo === "FEMALE" &&
                  styles.selected,
                ]}
                onPress={() =>
                  setSexo("FEMALE")
                }
              >
                <Text style={styles.optionText}>
                  Feminino
                </Text>
              </TouchableOpacity>

            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setStep(2)}
            >

              <Text style={styles.buttonText}>
                Continuar
              </Text>

            </TouchableOpacity>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>
    );
  }

  /* =========================
      2
  ========================= */

  if (step === 2) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>

            {renderMascote(
              "Agora me conta:\ncomo é sua rotina de exercícios?"
            )}

            <Text style={styles.title}>
              Nível de atividade
            </Text>

            {[
              "Sedentário",
              "Pouco ativo",
              "Ativo (2 a 3 vezes por semana)",
              "Muito ativo (Todos os dias)",
            ].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionFull,
                  atividade === item &&
                  styles.selected,
                ]}
                onPress={() =>
                  setAtividade(item)
                }
              >
                <Text style={styles.optionText}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.button}
              onPress={() => setStep(3)}
            >
              <Text style={styles.buttonText}>
                Continuar
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>
    );
  }

  /* =========================
     3
  ========================= */

  if (step === 3) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>

            {renderMascote(
              "Última etapa!\nQual é seu principal objetivo?"
            )}

            <Text style={styles.title}>
              Seu objetivo
            </Text>

            {[
              "Perder Peso",
              "Ganhar Peso",
              "Manter Peso",
            ].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionFull,
                  objetivo === item &&
                  styles.selected,
                ]}
                onPress={() =>
                  setObjetivo(item)
                }
              >
                <Text style={styles.optionText}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.button}
              onPress={() => setStep(4)}
            >
              <Text style={styles.buttonText}>
                Finalizar
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View>
    );
  }

  /* =========================
      4
  ========================= */

  return (
    <View style={styles.loadingContainer}>

      <Text style={styles.loadingTitle}>
        O Nutri está montando tudo
        para você!
      </Text>

      <Image
        source={require("@/assets/images/nutri-calculo.png")}
        style={styles.calculoImage}
      />

      <Text style={styles.loadingText}>
        Agora o Nutri vai analisar suas
        informações, calcular seus dados
        e preparar uma experiência
        personalizada pra você!
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          loading && { opacity: 0.6 },
        ]}
        onPress={finalizar}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? "Preparando..."
            : "Continuar"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  content: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
  },

  mascoteContainer: {
    flexDirection:
      width < 700 ? "column" : "row",

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 35,
    gap: 15,
  },

  mascote: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },

  balao: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2d2d2d",
    maxWidth: 300,
  },

  balaoTexto: {
    color: "white",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },

  title: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    color: "#aaa",
    marginBottom: 30,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },

  input: {
    width: "100%",
    backgroundColor: "#1c1c1c",
    color: "white",
    padding: 16,
    borderRadius: 14,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    width: "100%",
  },

  option: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },

  optionFull: {
    width: "100%",
    backgroundColor: "#1c1c1c",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2d2d2d",
  },

  selected: {
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "#16351d",
  },

  optionText: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },

  button: {
    width: "100%",
    backgroundColor: "#4CAF50",
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  calculoImage: {
    width: 260,
    height: 260,
    resizeMode: "contain",
    marginBottom: 30,
  },

  loadingTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
    maxWidth: 500,
  },

  loadingText: {
    color: "#bdbdbd",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 25,
    marginBottom: 35,
    maxWidth: 420,
  },
});