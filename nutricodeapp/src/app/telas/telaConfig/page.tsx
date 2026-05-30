import Colors from "@/constants/Colors";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    useRouter,
} from "expo-router";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";

import {
    useState,
} from "react";

import {
    logout,
} from "@/src/services/authService";

import {
    deletarUsuarioService,
} from "@/src/services/deletarUsuarioService";

import {
    pegarUsuario,
} from "@/src/utils/storage";

import { requisicao } from "@/src/services/api";

export default function TelaConfiguracoes() {

    const router = useRouter();

    const [loadingLogout, setLoadingLogout] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    // Modal de confirmação de e-mail
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [emailInput, setEmailInput] = useState("");
    const [emailError, setEmailError] = useState("");

    /* =========================
       LOGOUT
    ========================= */

    async function handleLogout() {

        Alert.alert(
            "Sair da conta",
            "Tem certeza que deseja sair da sua conta?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Sair",
                    style: "destructive",

                    onPress: async () => {
                        try {
                            setLoadingLogout(true);
                            await logout();
                            router.replace("/signin/page");
                        } catch (err) {
                            console.log("❌ Erro logout:", err);
                            Alert.alert("Erro", "Não foi possível sair da conta.");
                        } finally {
                            setLoadingLogout(false);
                        }
                    },
                },
            ]
        );
    }

    /* =========================
       DELETAR CONTA
    ========================= */

    // Abre o modal e limpa o estado anterior
    function handleDeletePress() {
        setEmailInput("");
        setEmailError("");
        setDeleteModalVisible(true);
    }

    function handleCancelDelete() {
        setDeleteModalVisible(false);
        setEmailInput("");
        setEmailError("");
    }

    async function handleConfirmDelete() {

        // Validação básica
        if (!emailInput.trim()) {
            setEmailError("Por favor, digite seu e-mail.");
            return;
        }

        try {
            setLoadingDelete(true);
            setEmailError("");

            // Busca o e-mail do usuário autenticado
            const response = await requisicao("/users/me");
            const userEmail: string = response?.email ?? "";

            if (emailInput.trim().toLowerCase() !== userEmail.toLowerCase()) {
                setEmailError("O e-mail digitado não corresponde ao da sua conta.");
                return;
            }

            // E-mail confere — prossegue com a exclusão
            const user = await pegarUsuario();

            if (!user?.id) {
                throw new Error("Usuário inválido");
            }

            await deletarUsuarioService(user.id);

            setDeleteModalVisible(false);
            router.replace("/signin/page");

        } catch (err: any) {
            // Erros de rede ou servidor — não sobrescreve mensagem de validação já exibida
            if (!emailError) {
                console.log("❌ Erro deletar:", err);
                Alert.alert("Erro", "Não foi possível deletar sua conta.");
            }
        } finally {
            setLoadingDelete(false);
        }
    }

    /* =========================
       RENDER
    ========================= */

    return (

        <>
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.title}>Configurações</Text>
                    <Text style={styles.subtitle}>Gerencie sua conta e preferências</Text>
                </View>

                {/* CONTA */}
                <View style={styles.card}>

                    <Text style={styles.sectionTitle}>Conta</Text>

                    {/* LOGOUT */}
                    <TouchableOpacity
                        style={styles.option}
                        activeOpacity={0.85}
                        onPress={handleLogout}
                        disabled={loadingLogout}
                    >
                        <View style={styles.optionContent}>
                            <View style={[styles.iconCircle, { backgroundColor: "#16351d" }]}>
                                <Ionicons name="log-out-outline" size={22} color={Colors.green} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.optionTitle}>Sair da conta</Text>
                                <Text style={styles.optionDescription}>Encerrar sessão atual</Text>
                            </View>
                        </View>

                        {loadingLogout ? (
                            <ActivityIndicator color={Colors.green} />
                        ) : (
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        )}
                    </TouchableOpacity>

                    {/* DELETE */}
                    <TouchableOpacity
                        style={[styles.option, { borderColor: "#441818" }]}
                        activeOpacity={0.85}
                        onPress={handleDeletePress}
                        disabled={loadingDelete}
                    >
                        <View style={styles.optionContent}>
                            <View style={[styles.iconCircle, { backgroundColor: "#351616" }]}>
                                <Ionicons name="trash-outline" size={22} color="#ff5c5c" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.optionTitle, { color: "#ff6b6b" }]}>
                                    Excluir conta
                                </Text>
                                <Text style={styles.optionDescription}>
                                    Remover permanentemente sua conta
                                </Text>
                            </View>
                        </View>

                        {loadingDelete ? (
                            <ActivityIndicator color="#ff5c5c" />
                        ) : (
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        )}
                    </TouchableOpacity>

                </View>

            </ScrollView>

            {/* MODAL — CONFIRMAÇÃO POR E-MAIL */}
            <Modal
                visible={deleteModalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCancelDelete}
            >
                <KeyboardAvoidingView
                    style={styles.modalBg}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <View style={styles.modal}>

                        {/* Ícone */}
                        <View style={styles.modalIconWrap}>
                            <Ionicons name="warning-outline" size={32} color="#ff5c5c" />
                        </View>

                        <Text style={styles.modalTitle}>Excluir conta</Text>

                        <Text style={styles.modalText}>
                            Esta ação é{" "}
                            <Text style={{ color: "#ff6b6b", fontWeight: "700" }}>
                                permanente e irreversível.
                            </Text>
                            {"\n\n"}
                            Para confirmar, digite o e-mail associado à sua conta:
                        </Text>

                        {/* Campo de e-mail */}
                        <TextInput
                            style={[
                                styles.emailInput,
                                emailError ? styles.emailInputError : null,
                            ]}
                            placeholder="seu@email.com"
                            placeholderTextColor="#555"
                            value={emailInput}
                            onChangeText={(text) => {
                                setEmailInput(text);
                                if (emailError) setEmailError("");
                            }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            editable={!loadingDelete}
                        />

                        {/* Mensagem de erro */}
                        {!!emailError && (
                            <Text style={styles.errorText}>{emailError}</Text>
                        )}

                        {/* Botões */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelDelete}
                            disabled={loadingDelete}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.confirmDelete,
                                loadingDelete && { opacity: 0.6 },
                            ]}
                            onPress={handleConfirmDelete}
                            disabled={loadingDelete}
                            activeOpacity={0.85}
                        >
                            {loadingDelete ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.confirmText}>Excluir permanentemente</Text>
                            )}
                        </TouchableOpacity>

                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#0f0f0f",
        paddingHorizontal: 20,
    },

    header: {
        marginTop: 70,
        marginBottom: 35,
        alignItems: "center",
    },

    title: {
        color: "white",
        fontSize: 36,
        fontWeight: "bold",
        textAlign: "center",
    },

    subtitle: {
        color: "#aaa",
        fontSize: 15,
        marginTop: 10,
        textAlign: "center",
        lineHeight: 22,
    },

    card: {
        backgroundColor: "#1c1c1c",
        borderRadius: 28,
        padding: 24,
        marginTop: 20,
    },

    sectionTitle: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 28,
        textAlign: "center",
    },

    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#161616",
        borderRadius: 22,
        paddingVertical: 24,
        paddingHorizontal: 22,
        marginBottom: 22,
        borderWidth: 1,
        borderColor: "#2a2a2a",
        minHeight: 110,
    },

    optionContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 16,
    },

    textContainer: {
        flex: 1,
        marginLeft: 18,
        paddingRight: 10,
    },

    iconCircle: {
        width: 58,
        height: 58,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },

    optionTitle: {
        color: "white",
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 6,
        flexShrink: 1,
    },

    optionDescription: {
        color: "#8b8b8b",
        fontSize: 13,
        lineHeight: 19,
        flexShrink: 1,
    },

    //  Modal 

    modalBg: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.80)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },

    modal: {
        width: "100%",
        backgroundColor: "#1c1c1c",
        borderRadius: 28,
        padding: 26,
    },

    modalIconWrap: {
        alignSelf: "center",
        backgroundColor: "#351616",
        width: 64,
        height: 64,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
    },

    modalTitle: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 14,
        textAlign: "center",
    },

    modalText: {
        color: "#bdbdbd",
        fontSize: 15,
        lineHeight: 24,
        textAlign: "center",
        marginBottom: 22,
    },

    emailInput: {
        backgroundColor: "#111",
        borderWidth: 1,
        borderColor: "#333",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 18,
        color: "white",
        fontSize: 15,
        marginBottom: 8,
    },

    emailInputError: {
        borderColor: "#ff5c5c",
    },

    errorText: {
        color: "#ff5c5c",
        fontSize: 13,
        marginBottom: 16,
        marginLeft: 4,
    },

    cancelButton: {
        backgroundColor: "#2a2a2a",
        padding: 18,
        borderRadius: 16,
        alignItems: "center",
        marginTop: 12,
        marginBottom: 12,
    },

    cancelText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },

    confirmDelete: {
        backgroundColor: "#dc2626",
        padding: 18,
        borderRadius: 16,
        alignItems: "center",
    },

    confirmText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
});